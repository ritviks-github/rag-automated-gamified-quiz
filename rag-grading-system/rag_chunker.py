import os
import uuid
import json
import fitz  # PyMuPDF
from PIL import Image
import pytesseract
import io
from sentence_transformers import SentenceTransformer

# ---- CONFIG ----
CHUNK_SIZE = 500   # characters
CHUNK_OVERLAP = 50
EMBED_MODEL = "intfloat/e5-large-v2"

# ---- INIT MODEL ----
print("[INFO] Loading embedding model...")
model = SentenceTransformer(EMBED_MODEL)




def extract_text_from_pdf(pdf_path):
    """
    Extracts text from a PDF using PyMuPDF.
    Falls back to OCR (pytesseract) for pages with no text.
    """
    doc = fitz.open(pdf_path)
    full_text = ""

    for page_number, page in enumerate(doc):
        text = page.get_text().strip()
        if text:
            full_text += text + "\n\n"
        else:
            # No text detected → use OCR
            pix = page.get_pixmap(dpi=200)  # increase DPI for better OCR accuracy
            img = Image.open(io.BytesIO(pix.tobytes("png")))
            ocr_text = pytesseract.image_to_string(img)
            full_text += ocr_text + "\n\n"

    return full_text

def chunk_text(text, chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    """Split text into overlapping chunks."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks

def create_chunks(pdf_path, professor_id, quiz_id, document_id):
    """Process PDF → Chunks with embeddings."""
    text = extract_text_from_pdf(pdf_path)
    raw_chunks = chunk_text(text)

    chunk_records = []

    print(f"[INFO] Creating {len(raw_chunks)} chunks...")
    for idx, chunk in enumerate(raw_chunks):
        emb = model.encode(chunk).tolist()

        chunk_record = {
            "chunk_id": str(uuid.uuid4()),
            "professor_id": professor_id,
            "quiz_id": quiz_id,
            "document_id": document_id,
            "chunk_index": idx,
            "text": chunk,
            "embedding": emb
        }
        chunk_records.append(chunk_record)

    return chunk_records
