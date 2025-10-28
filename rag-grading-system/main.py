# main.py
import uuid
import os
import tempfile
from fastapi import FastAPI, File, UploadFile, Form
from fastapi import Body
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from rag_chunker import create_chunks, normalize_text
import google.generativeai as genai
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
genai.configure(api_key=GENAI_API_KEY)
LLM_MODEL = "gemini-2.5-flash-lite"

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
- Provide a JSON object with exactly these fields:
  - "score": number between 0 and 1
  - "feedback": string explaining the score
- JSON only, no extra formatting
"""

    try:
        model = genai.GenerativeModel(LLM_MODEL)
        resp = model.generate_content(prompt)

        # New SDK: resp.text
        if hasattr(resp, "text"):
            raw_output = resp.text.strip()
        # Older SDK: resp.candidates[0].content.parts[0].text
        elif hasattr(resp, "candidates"):
            raw_output = resp.candidates[0].content.parts[0].text
        else:
            raw_output = ""
            
    except Exception as e:
        return {"score": 0, "feedback": f"Gemini call failed: {e}"}

    return extract_score_from_llm(raw_output)




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

    overall_score = sum(e["score"] for e in evaluations) if evaluations else 0

    return {
        "evaluations": evaluations,
        "overallScore": overall_score
    }

def make_embeddings(texts: List[str]) -> List[List[float]]:
    """
    Generate embeddings for a list of texts using the same model as used in chunking.
    Ensures consistent embedding space for retrieval and evaluation.
    """
    normalized = [normalize_text(t) for t in texts]
    embeddings = model.encode(normalized, normalize_embeddings=True).tolist()
    return embeddings


@app.post("/normalize-scores")
async def normalize_scores(payload: dict = Body(...)):
    
    all_responses = payload.get("allResponses", [])
    quiz_data = payload.get("quiz", None)
    highest_scorer_id = payload.get("highestScorerId", None)
    test_id = payload.get("testId", None)

    if not all_responses or not test_id:
        return {"error": "Missing required data: allResponses or testId"}

    # Step 1: Group answers by questionId
    question_map = {}
    for result in all_responses:
        for resp in result["responses"]:
            qid = resp["questionId"]
            if qid not in question_map:
                question_map[qid] = []
            question_map[qid].append({
                "studentId": result["studentId"],
                "answer": resp["answer"]
            })
    
    question_text_map = {}
    if quiz_data:
        for q in quiz_data.get("questions", []):
            # support both _id and id keys
            key = q.get("_id") or q.get("id")
            question_text_map[key] = q.get("text", "")

    normalized_scores_map = {}

    # Step 2: Process each question
    for qid, answers in question_map.items():
        texts = [a["answer"] for a in answers]
        embeddings = make_embeddings(texts)
        sims = cosine_similarity(embeddings)

        # Step 3: Compute average similarity per student
        avg_similarities = sims.mean(axis=1)
        min_s, max_s = np.min(avg_similarities), np.max(avg_similarities)

        # Step 4: Handle identical or near-identical answers
        if abs(max_s - min_s) < 1e-6:
            # All answers are semantically identical — skip normalization
            adjusted_scores = avg_similarities.tolist()
        else:
            # Perform z-score-like normalization between 0 and 1
            norm_scores = (avg_similarities - min_s) / (max_s - min_s + 1e-6)

            # Step 5: LLM moderation for fairness
            try:
                # --- 🧠 Grounding context preparation ---
                question_text = question_text_map.get(qid, "Unknown question text.")

                # Find top scorer’s answer for this question
                top_answer_obj = next((a for a in answers if a["studentId"] == highest_scorer_id), None)
                top_answer = top_answer_obj["answer"] if top_answer_obj else ""

                # Retrieve top chunks related to top scorer’s answer
                chunks = retrieve_top_chunks(top_answer, test_id, top_k=5) if top_answer else []
                context_text = "\n".join(chunks) or "No context available from uploaded material."

                prompt = f"""
You are a fair academic evaluator. Your goal is to moderate normalized similarity scores of students' answers.

Question:
{question_text}

Lecture Context:
{context_text}

Top Student's (Highest Scorer's) Answer:
{top_answer}

Now, here are all the student answers and their preliminary normalized similarity scores:
{json.dumps(list(zip([a["studentId"] for a in answers], [a["answer"] for a in answers], norm_scores)), indent=2)}

Instructions:
- Compare each answer's semantic meaning and correctness relative to the top student's answer and context.
- Keep identical answers at the same score.
- If an answer is clearly worse or off-topic compared to the top student's answer or the context, slightly reduce its score.
- If an answer is comparable in meaning and completeness, keep its score near the top student's.
- Output ONLY a JSON array of adjusted normalized scores, in the same order as given.
"""

                model_llm = genai.GenerativeModel(
                    LLM_MODEL,
                    generation_config={"temperature": 0, "top_p": 1}
                )
                resp = model_llm.generate_content(prompt)

                raw_output = resp.text.strip()
                # Extract JSON array from model output safely
                match = re.search(r"\[.*\]", raw_output, re.DOTALL)
                if match:
                    adjusted_scores = json.loads(match.group())
                else:
                    # If parsing fails, fallback to norm_scores
                    adjusted_scores = norm_scores

                # Ensure adjusted_scores length matches answers length
                if len(adjusted_scores) != len(answers):
                    adjusted_scores = norm_scores

            except Exception as e:
                print(f"[WARN] LLM moderation failed for qid={qid}: {e}")
                adjusted_scores = norm_scores

        # Step 3: Assign back normalized score to each student
        for i, ans in enumerate(answers):
            sid = ans["studentId"]
            if sid not in normalized_scores_map:
                normalized_scores_map[sid] = []
            normalized_scores_map[sid].append({
                "questionId": qid,
                "answer": ans["answer"],
                "normalizedScore": float(adjusted_scores[i])
            })

    # Step 4: Build final output
    final_output = [
        {"studentId": sid, "responses": responses}
        for sid, responses in normalized_scores_map.items()
    ]

    return {
        "status": "success",
        "normalizedResults": final_output
    }

def retrieve_top_chunks(user_answer, quiz_id, top_k=5):
    # Step 1: Embed user answer
    normalized_answer = normalize_text(user_answer)
    query_vector = model.encode(normalized_answer).tolist()

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
