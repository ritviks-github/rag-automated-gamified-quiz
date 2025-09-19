# main.py
import uuid
import os
import tempfile
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from rag_chunker import create_chunks
import google.genai as genai
import json
from pydantic import BaseModel, Field
from typing import List, Union, Optional, Any
# Qdrant imports
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from rag_chunker import model
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Qdrant Setup ----
qdrant = QdrantClient(url="http://localhost:6333")  # or your Qdrant Cloud URL

# Make sure collection exists
EMBEDDING_DIM = 1024   # for e5-large-v2
COLLECTION_NAME = "quiz_chunks"

# --- Gemini Setup ---
GENAI_API_KEY = ""
genai_client = genai.Client(api_key=GENAI_API_KEY)
LLM_MODEL = "gemini-1.5-flash"

try:
    qdrant.get_collection(COLLECTION_NAME)
except Exception:
    print("[INFO] Creating Qdrant collection...")
    qdrant.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=qmodels.VectorParams(size=EMBEDDING_DIM, distance="Cosine"),
    )

class QuestionModel(BaseModel):
    id: str = Field(..., alias="_id")   # maps Mongo’s `_id` to `id`
    text: str
    score: float
    type: str
    options: Optional[List[str]] = []
    correctAnswers: Optional[List[int]] = []
    timeLimit: int

    class Config:
        allow_population_by_field_name = True

class QuizModel(BaseModel):
    _id: Optional[str] = None
    roomId: str
    professorId: str
    questions: List[QuestionModel]

class ResponseModel(BaseModel):
    questionId: str
    answer: Any

class ResultModel(BaseModel):
    studentId: str
    testId: str
    responses: List[ResponseModel]

class EvalRequest(BaseModel):
    quiz: QuizModel
    result: ResultModel


def extract_score_from_llm(raw_output: str) -> dict:
    """
    Extracts JSON from LLM response and returns a dict with 'score' and 'feedback'.
    If JSON cannot be parsed, returns score=0 and raw feedback.
    """
    # Remove ```json or ``` wrapping
    cleaned = re.sub(r"```(?:json)?", "", raw_output, flags=re.IGNORECASE).strip()

    # Sometimes LLMs add extra text before/after JSON, try to extract {...} block
    json_match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass

    # Fallback: try to parse as plain JSON
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {"score": 0, "feedback": cleaned or "Invalid response from Gemini."}

def call_gemini(question: str, student_answer: str, context: str) -> dict:
    prompt = f"""
You are an expert grader. Use the provided context to assess the student's answer.

Context:
{context}

Question:
{question}

Student Answer:
{student_answer}

Instructions:
- Provide a JSON object with **exactly these fields**:
  - "score": number between 0 and 1
  - "feedback": string explaining the score
- **Do not wrap inside another object or add extra text**
- JSON only, no extra formatting
"""

    resp = genai_client.models.generate_content(
        model=LLM_MODEL,
        contents=prompt
    )

    try:
        raw_output = resp.candidates[0].content.parts[0].text.strip()
    except (AttributeError, IndexError):
        raw_output = ""

    try:
        return extract_score_from_llm(raw_output)
        
    except json.JSONDecodeError:
        return {"score": 0, "feedback": raw_output or "Invalid response from Gemini."}




@app.post("/evaluate-quiz")
async def evaluate_quiz(data: EvalRequest):
    quiz = data.quiz
    result = data.result
    evaluations = []

    for r in result.responses:
        # Find question by _id (not id)
        question_obj = next((q for q in quiz.questions if q.id == r.questionId), None)

        if not question_obj:
            evaluations.append({
                "questionId": r.questionId,
                "score": 0,
                "feedback": "Question not found in quiz data."
            })
            continue

        # Handle MCQ
        if question_obj.type == "mcq":
            user_answers = r.answer if isinstance(r.answer, list) else [r.answer]
            correct_set = set(question_obj.correctAnswers or [])
            user_set = set(user_answers)

            score = 1.0 if user_set == correct_set else 0.0
            feedback = f"MCQ: {score*100:.0f}% correct."

        # Handle Subjective
        else:
            context_chunks = retrieve_top_chunks(r.answer, result.testId, top_k=5)
            context = "\n".join(context_chunks)

            eval_result = call_gemini(question_obj.text, r.answer, context)
            score = float(eval_result.get("score", 0)) * question_obj.score
            feedback = eval_result.get("feedback", "No feedback returned.")

        evaluations.append({
            "questionId": r.questionId,
            "score": score,
            "feedback": feedback
        })

    overall_score = sum(e["score"] for e in evaluations) / len(evaluations) if evaluations else 0

    return {
        "evaluations": evaluations,
        "overallScore": overall_score
    }

def retrieve_top_chunks(user_answer, quiz_id, top_k=5):
    # Step 1: Embed user answer
    query_vector = model.encode(user_answer).tolist()

    # Step 2: Search in Qdrant (filter by quiz_id to scope results)
    search_result = qdrant.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_vector,
        limit=top_k,
        query_filter=qmodels.Filter(
            must=[
                qmodels.FieldCondition(
                    key="quiz_id",
                    match=qmodels.MatchValue(value=quiz_id)
                )
            ]
        )
    )

    return [hit.payload["text"] for hit in search_result]

@app.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    professor_id: str = Form(...),
    quiz_id: str = Form(...),
    document_id: str = Form(None)
):
    if not document_id:
        document_id = str(uuid.uuid4())

    # Save the uploaded file temporarily
    try:
        suffix = os.path.splitext(file.filename)[-1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Failed to save uploaded file: {e}"})

    try:
        # Run chunk creation
        chunks = create_chunks(tmp_path, professor_id, quiz_id, document_id)

        # Push chunks to Qdrant
        qdrant.upsert(
            collection_name=COLLECTION_NAME,
            points=[
                qmodels.PointStruct(
                    id=chunk["chunk_id"],
                    vector=chunk["embedding"],
                    payload={
                        "professor_id": chunk["professor_id"],
                        "quiz_id": chunk["quiz_id"],
                        "document_id": chunk["document_id"],
                        "chunk_index": chunk["chunk_index"],
                        "text": chunk["text"],
                    },
                )
                for chunk in chunks
            ],
        )

    except Exception as e:
        os.unlink(tmp_path)
        return JSONResponse(status_code=500, content={"error": f"Chunking or Qdrant upload failed: {e}"})
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

    return {
        "status": "success",
        "inserted_chunks": len(chunks),
        "document_id": document_id,
        "chunks": chunks 
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
