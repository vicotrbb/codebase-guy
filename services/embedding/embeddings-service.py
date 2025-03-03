# embeddings-service.py
from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModel
import torch

app = Flask(__name__)

MODEL_NAME = "microsoft/codebert-base"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME)
model.eval()

def get_embedding(text: str, chunk_size=512, overlap=100):
    """Generate embeddings for longer texts by chunking and averaging."""
    if not text:
        return [0.0] * model.config.hidden_size  # Return zero vector for empty input
    
    # For short texts, use the standard approach
    if len(tokenizer.encode(text)) <= 512:
        inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        with torch.no_grad():
            outputs = model(**inputs)
        return outputs.last_hidden_state[:, 0, :].squeeze().tolist()
    
    # For longer texts, chunk and average embeddings
    tokens = tokenizer.encode(text)
    chunks = []
    
    # Create overlapping chunks
    i = 0
    while i < len(tokens):
        end = min(i + chunk_size, len(tokens))
        chunk = tokens[i:end]
        chunks.append(chunk)
        if end == len(tokens):
            break
        i += chunk_size - overlap
    
    # Generate embeddings for each chunk
    chunk_embeddings = []
    for chunk in chunks:
        inputs = {"input_ids": torch.tensor([chunk]), "attention_mask": torch.tensor([[1] * len(chunk)])}
        with torch.no_grad():
            outputs = model(**inputs)
        chunk_embedding = outputs.last_hidden_state[:, 0, :].squeeze()
        chunk_embeddings.append(chunk_embedding)
    
    # Average the embeddings
    if chunk_embeddings:
        avg_embedding = torch.mean(torch.stack(chunk_embeddings), dim=0).tolist()
        return avg_embedding
    return [0.0] * model.config.hidden_size  # Fallback

@app.route("/api/embeddings", methods=["POST"])
def embed():
    data = request.get_json()
    text = data.get("text", "")
    embedding = get_embedding(text)
    return jsonify({"embedding": embedding})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050)
