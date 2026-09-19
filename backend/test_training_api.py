import sys
import asyncio
from fastapi.testclient import TestClient
from app.main import app

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

client = TestClient(app)

def test_training_flow():
    print("--- 1. Testing GET /api/ai/trained-rules ---")
    res = client.get("/api/ai/trained-rules")
    print(f"Status: {res.status_code}, Body: {res.json()}")

    print("\n--- 2. Testing POST /api/ai/train (Training a correction) ---")
    train_payload = {
        "query_pattern": "What is the capital of Tamil Nadu weather station?",
        "corrected_answer": "Chennai Regional Meteorological Centre (RMC) located at Nungambakkam is the primary station.",
        "target_intent": "meteorological_geography",
        "language_code": "en"
    }
    train_res = client.post("/api/ai/train", json=train_payload)
    print(f"Train Status: {train_res.status_code}, Body: {train_res.json()}")
    assert train_res.status_code == 200
    rule_id = train_res.json()["rule"]["id"]

    print("\n--- 3. Testing Chatbot Query with the Trained Question ---")
    chat_payload = {
        "query": "What is the capital of Tamil Nadu weather station?",
        "location": "Chennai",
        "lang_code": "en"
    }
    chat_res = client.post("/api/ai/chatbot", json=chat_payload)
    print(f"Chatbot Status: {chat_res.status_code}")
    data = chat_res.json()
    print(f"Tool called: {data.get('tool_called')}")
    print(f"Text:\n{data.get('text')}")
    assert "Chennai Regional Meteorological Centre" in data.get("text", "")
    assert "Trained AI Knowledge Rule" in data.get("tool_called", "")

    print("\n--- 4. Testing DELETE /api/ai/trained-rules/{id} ---")
    del_res = client.delete(f"/api/ai/trained-rules/{rule_id}")
    print(f"Delete Status: {del_res.status_code}, Body: {del_res.json()}")
    assert del_res.status_code == 200

    print("\nALL TRAINING TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    test_training_flow()
