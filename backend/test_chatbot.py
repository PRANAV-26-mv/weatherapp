import sys
import io
import asyncio
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from app.chatbot_service import process_chatbot_query

test_questions = [
    ("Can I dry clothes today?", "en"),
    ("Is it safe to go swimming?", "en"),
    ("Who won the world cup?", "en"),
    ("Can I wash my car today?", "en"),
    ("Is it good for jogging or running this morning?", "en"),
    ("Will it rain tomorrow in Chennai?", "en"),
    ("What should I wear today?", "en"),
    ("How hot is it right now?", "en"),
    ("Is it humid today?", "en"),
    ("What is dew point?", "en"),
    ("Tell me about tsunami", "en"),
    ("What is a barometer?", "en"),
    ("How does thunder happen?", "en"),
    ("Can I plant paddy now?", "en"),
    ("நாளைக்கு துணி காய வைக்கலாமா?", "ta"),
    ("இன்று நீச்சல் அடிக்கலாமா?", "ta"),
    ("சென்னையில் மழை பெய்யுமா?", "ta"),
    ("கார் கழுவலாமா?", "ta"),
    ("आज कपड़े सुखा सकते हैं क्या?", "hi"),
    ("क्या आज तैरने जा सकते हैं?", "hi")
]

async def run():
    ctx = {
        "tempC": 31,
        "humidity": 62,
        "conditionText": "Partly Cloudy",
        "rainProbabilityPct": 15,
        "windSpeedKmh": 10,
        "uvIndex": 7
    }
    for q, lang in test_questions:
        res = await process_chatbot_query(q, location="Coimbatore", weather_context=ctx, lang_code=lang)
        print("="*60)
        print(f"Q: {q} ({lang})")
        print(f"Tool: {res.get('tool_called')}")
        print(f"Answer: {res.get('text')[:250]}...\n")

if __name__ == "__main__":
    asyncio.run(run())
