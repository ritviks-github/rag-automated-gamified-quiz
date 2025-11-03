from facenet_pytorch import InceptionResnetV1, MTCNN
from PIL import Image
import numpy as np
import torch
import tempfile

device = 'cpu'
print(f"🔧 Loading FaceNet model on device: {device} ...")

model = InceptionResnetV1(pretrained='vggface2').eval().to(device)
mtcnn = MTCNN(image_size=160, margin=0, device=device)

def get_embedding(img_path: str):
    """Extracts face embedding from an image file."""
    try:
        img = Image.open(img_path).convert('RGB')
        face = mtcnn(img)
        if face is None:
            return None
        embedding = model(face.unsqueeze(0).to(device)).detach().cpu().numpy()[0]
        return embedding
    except Exception as e:
        print(f"⚠️ Error processing {img_path}: {e}")
        return None

def recognize_face(source_path: str, verify_path: str, threshold: float = 0.8) -> dict:
    """Compares two faces and returns verification result."""
    emb1 = get_embedding(source_path)
    emb2 = get_embedding(verify_path)

    if emb1 is None or emb2 is None:
        return {"verified": False, "distance": None, "reason": "No face detected"}

    distance = np.linalg.norm(emb1 - emb2)
    verified = distance < threshold

    return {
        "verified": bool(verified),
        "distance": float(distance),
        "threshold": threshold,
        "model": "InceptionResnetV1 (VGGFace2)"
    }

