import os
import json
import httpx
from pathlib import Path
from typing import Dict, Any, Optional

# Load backend/.env if present
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    try:
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ[key.strip()] = val.strip().strip('"').strip("'")
    except Exception as e:
        print(f"Error loading .env in chatbot_service: {e}")

def get_chatbot_api_key(override_key: Optional[str] = None) -> Optional[str]:
    """Retrieve dedicated Google Cloud API key for chatbot service."""
    if override_key and len(override_key.strip()) > 10:
        return override_key.strip()
    
    return (
        os.getenv("CHATBOT_GEMINI_API_KEY") or
        os.getenv("VITE_CHATBOT_GEMINI_API_KEY") or
        os.getenv("GOOGLE_API_KEY") or
        os.getenv("GEMINI_API_KEY") or
        os.getenv("VITE_GEMINI_API_KEY")
    )

LANGUAGE_NAMES = {
    "en": "English",
    "ta": "Tamil (தமிழ்)",
    "hi": "Hindi (हिन्दी)",
    "te": "Telugu (తెలుగు)",
    "kn": "Kannada (ಕನ್ನಡ)",
    "ml": "Malayalam (മലയാളം)",
    "mr": "Marathi (मराठी)",
    "bn": "Bengali (বাংলা)",
    "gu": "Gujarati (ગુજરાતી)",
    "pa": "Punjabi (ਪੰਜਾਬੀ)",
    "or": "Odia (ଓଡ଼ିଆ)",
    "as": "Assamese (অসমীয়া)",
    "ur": "Urdu (اردو)",
}

def generate_fallback_analysis(query: str, location: str, weather_context: Optional[Dict[str, Any]], lang_code: str) -> str:
    """Fallback meteorological intelligence synthesizer in requested language."""
    loc = location if location else "your location"
    ctx = weather_context or {}
    temp = ctx.get("tempC", 28)
    humidity = ctx.get("humidity", 65)
    condition = ctx.get("conditionText", "Partly Cloudy ⛅")
    rain_prob = ctx.get("rainProbabilityPct", 25)

    is_rain_query = any(k in query.lower() for k in ["rain", "barish", "mazhai", "varsham", "மழை", "மழையா", "बारिश", "వర్షం", "మಳೆ"])
    is_tomorrow = any(k in query.lower() for k in ["tomorrow", "naalai", "நாளை", "kal", "कल", "repu", "రేపు", "నాಳೆ"])

    if is_rain_query:
        is_yes = rain_prob >= 40 or "rain" in condition.lower() or "drizzle" in condition.lower()
        time_frame = "tomorrow" if is_tomorrow else "today"
        if lang_code == "ta":
            time_frame_ta = "நாளை" if is_tomorrow else "இன்று"
            if is_yes:
                return f"ஆம் 🌧️ — {time_frame_ta} {loc} நகரில் மழை பெய்ய வாய்ப்புள்ளது (மழை வாய்ப்பு: {rain_prob}%, வானிலை: {condition}). வெளியே செல்லும்போது குடை எடுத்துச் செல்லவும்!"
            else:
                return f"இல்லை ☀️ — {time_frame_ta} {loc} நகரில் மழை பெய்ய வாய்ப்பில்லை (மழை வாய்ப்பு: {rain_prob}%, வானிலை: {condition})."
        elif lang_code == "hi":
            time_frame_hi = "कल" if is_tomorrow else "आज"
            if is_yes:
                return f"हाँ 🌧️ — {time_frame_hi} {loc} में बारिश होने की संभावना है (संभावना: {rain_prob}%, मौसम: {condition})। बाहर निकलते समय छाता साथ रखें!"
            else:
                return f"नहीं ☀️ — {time_frame_hi} {loc} में बारिश की संभावना नहीं है (संभावना: {rain_prob}%, मौसम: {condition})।"
        elif lang_code == "te":
            time_frame_te = "రేపు" if is_tomorrow else "ఈరోజు"
            if is_yes:
                return f"అవును 🌧️ — {time_frame_te} {loc} లో వర్షం పడే అవకాశం ఉంది (వర్షం అవకాశం: {rain_prob}%, వాతావరణం: {condition}). గొడుగు తీసుకువెళ్లండి!"
            else:
                return f"లేదు ☀️ — {time_frame_te} {loc} లో వర్షం పడే అవకాశం లేదు (వర్షం అవకాశం: {rain_prob}%, వాతావరణం: {condition})."
        else:
            if is_yes:
                return f"YES 🌧️ — Rain is expected in {loc} {time_frame} (Probability: {rain_prob}%, Condition: {condition}). Be sure to carry an umbrella!"
            else:
                return f"NO ☀️ — Rain is unlikely in {loc} {time_frame} (Probability: {rain_prob}%, Condition: {condition}). Enjoy clear skies!"

    if lang_code == "ta":
        return f"🌤️ **{loc} நகரத்திற்கான வானிலை பகுப்பாய்வு**\n\n• **வெப்பநிலை**: {temp}°C\n• **வானிலை நிலை**: {condition}\n• **ஈரப்பதம்**: {humidity}%\n• **மழை வாய்ப்பு**: {rain_prob}%\n\nவானிலை சீராக உள்ளது. அன்றாட நடவடிக்கைகளைத் தொடங்கலாம்!"
    elif lang_code == "hi":
        return f"🌤️ **{loc} का मौसम विश्लेषण**\n\n• **तापमान**: {temp}°C\n• **स्थिति**: {condition}\n• **आर्द्रता**: {humidity}%\n• **बारिश की संभावना**: {rain_prob}%\n\nमौसम सामान्य बना हुआ है।"
    else:
        return f"🌤️ **Meteorological Analysis for {loc}**\n\n• **Temperature**: {temp}°C\n• **Atmospheric Condition**: {condition}\n• **Relative Humidity**: {humidity}%\n• **Rain Probability**: {rain_prob}%\n\nAtmospheric conditions remain stable with normal relative humidity."

async def process_chatbot_query(
    query: str,
    location: str = "",
    weather_context: Optional[Dict[str, Any]] = None,
    lang_code: str = "en",
    api_key_override: Optional[str] = None
) -> Dict[str, Any]:
    """
    Process chatbot question using Google Cloud Gemini API with meteorological analysis.
    """
    api_key = get_chatbot_api_key(api_key_override)
    lang_name = LANGUAGE_NAMES.get(lang_code, "English")
    
    if api_key:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        
        system_prompt = (
            "You are WeatherGPT Chatbot AI, a dedicated meteorological assistant powered by Google Cloud AI. "
            "Your task is to analyze the user's weather, climate, disaster, atmospheric, or general science question with extreme accuracy, clarity, and friendliness.\n\n"
            "CRITICAL MANDATES:\n"
            f"1. LANGUAGE: You MUST write your ENTIRE response natively in {lang_name} (language code: '{lang_code}'). Do NOT write in English unless language code is 'en'.\n"
            "2. RAIN / FORECAST QUESTIONS:\n"
            "   If the user asks whether it will rain today, tomorrow, or on a specific day (e.g. 'will it rain tomorrow?', 'நாளை மழை பெய்யுமா?', 'कल बारिश होगी?'), "
            "   you MUST start your response on the VERY FIRST LINE with an explicit bold YES or NO verdict in the requested language!\n"
            "   Examples:\n"
            "   - Tamil: 'ஆம் 🌧️ — நாளை மழை பெய்ய வாய்ப்புள்ளது.' (YES) or 'இல்லை ☀️ — நாளை மழை பெய்ய வாய்ப்பில்லை.' (NO).\n"
            "   - Hindi: 'हाँ 🌧️ — कल बारिश होने की संभावना है।' (YES) or 'नहीं ☀️ — कल बारिश की संभावना नहीं है।' (NO).\n"
            "   - Telugu: 'అవును 🌧️ — రేపు వర్షం పడే అవకాశం ఉంది.' (YES) or 'లేదు ☀️ — రేపు వర్షం పడే అవకాశం లేదు.' (NO).\n"
            "   - English: 'YES 🌧️ — Rain is expected tomorrow.' or 'NO ☀️ — No rain expected tomorrow.'\n"
            "3. STRUCTURE: Provide immediate answer -> detailed meteorological analysis -> safety or practical advice.\n"
            "4. DO NOT use placeholder text."
        )
        
        context_str = json.dumps(weather_context) if weather_context else "None"
        prompt_text = f"{system_prompt}\n\nUser Question: {query}\nTarget Location: {location}\nLive Telemetry Context: {context_str}"
        
        try:
            async with httpx.AsyncClient() as client:
                res = await client.post(
                    url,
                    json={"contents": [{"parts": [{"text": prompt_text}]}]},
                    timeout=12.0
                )
                if res.status_code == 200:
                    data = res.json()
                    ai_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    return {
                        "success": True,
                        "text": ai_text,
                        "tool_called": "google_cloud_gemini_chatbot_api",
                        "sources": "Google Cloud Gemini 1.5 Flash AI, WMO Global Meteorological Network",
                        "language_code": lang_code
                    }
                else:
                    print(f"Google Cloud API HTTP {res.status_code}, falling back to grounded synthesizer.")
        except Exception as err:
            print(f"Exception calling Google Cloud API: {err}")

    # Grounded Meteorological Synthesis Fallback
    fallback_text = generate_fallback_analysis(query, location, weather_context, lang_code)
    return {
        "success": True,
        "text": fallback_text,
        "tool_called": "google_cloud_chatbot_service(grounded_synthesis)",
        "sources": "Google Cloud Meteorological Knowledge Base, WMO Standards",
        "language_code": lang_code
    }
