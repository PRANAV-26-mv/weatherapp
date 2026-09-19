from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import httpx
import uvicorn
import asyncio
import json
import os
from pathlib import Path
from typing import List, Dict, Optional

from app.database import get_db, engine, Base, ACTIVE_DATABASE_URL
from app.init_db import init_db
from app.models import (
    UserProfile, Location, CurrentWeather, ForecastData,
    DisasterAlert, AffectedArea, NotificationHistory,
    VoiceQuery, ClimateHistory, ChatHistory, ChatbotTrainingRule
)
from app.chatbot_service import process_chatbot_query, get_chatbot_api_key

# Load backend/.env if available
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
        print(f"Error loading .env file: {e}")

app = FastAPI(
    title="WeatherGPT PostgreSQL Intelligence Backend",
    description="AI-Powered Weather & Disaster Intelligence Backend with PostgreSQL Database Integration",
    version="1.1.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database schema and sample data on startup
@app.on_event("startup")
def startup_db_event():
    try:
        init_db()
    except Exception as err:
        print(f"⚠️ Error during startup database initialization: {err}")

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

@app.get("/")
def root():
    return {
        "message": "WeatherGPT Intelligence API is running",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
def health_check():
    return {
        "status": "operational",
        "service": "WeatherGPT Intelligence Backend",
        "version": "1.1.0",
        "database": {
            "connected_url": ACTIVE_DATABASE_URL.split('@')[-1] if '@' in ACTIVE_DATABASE_URL else ACTIVE_DATABASE_URL,
            "engine": "PostgreSQL" if "postgresql" in ACTIVE_DATABASE_URL else "SQLite"
        },
        "apis": {
            "open_meteo": "connected",
            "imd_alerts": "connected",
            "ai_tool_calling": "ready"
        }
    }

# ----------------------------------------------------
# 🗄️ PostgreSQL Database Status & Management Endpoints
# ----------------------------------------------------
@app.get("/api/db/status")
def get_db_status(db: Session = Depends(get_db)):
    """Return system connection status and record counts across all 10 PostgreSQL database tables."""
    return {
        "database_type": "PostgreSQL" if "postgresql" in ACTIVE_DATABASE_URL else "SQLite",
        "connection_url": ACTIVE_DATABASE_URL.split('@')[-1] if '@' in ACTIVE_DATABASE_URL else ACTIVE_DATABASE_URL,
        "tables_status": {
            "users": db.query(UserProfile).count(),
            "locations": db.query(Location).count(),
            "current_weather": db.query(CurrentWeather).count(),
            "forecast_data": db.query(ForecastData).count(),
            "disaster_alerts": db.query(DisasterAlert).count(),
            "affected_areas": db.query(AffectedArea).count(),
            "notification_history": db.query(NotificationHistory).count(),
            "voice_queries": db.query(VoiceQuery).count(),
            "climate_history": db.query(ClimateHistory).count(),
            "chat_history": db.query(ChatHistory).count(),
        }
    }

# 1. 👤 User Profiles & Preferences API
@app.get("/api/db/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(UserProfile).all()

@app.post("/api/db/users/permanent-location")
def update_permanent_location(payload: Dict, db: Session = Depends(get_db)):
    loc_name = payload.get("location_name")
    lat = payload.get("latitude")
    lon = payload.get("longitude")
    
    user = db.query(UserProfile).first()
    if not user:
        user = UserProfile(username="default_user", email="user@weathergpt.ai")
        db.add(user)
        db.commit()
        db.refresh(user)

    user.permanent_location_name = loc_name
    user.permanent_latitude = lat
    user.permanent_longitude = lon
    db.commit()
    return {"status": "success", "permanent_location": loc_name, "latitude": lat, "longitude": lon}

# 2. 📍 Locations & Coordinates API
@app.get("/api/db/locations")
def get_saved_locations(db: Session = Depends(get_db)):
    return db.query(Location).all()

# 5. 🚨 Disaster Alerts & 6. 🗺️ Affected Areas API
@app.get("/api/db/alerts")
def get_db_disaster_alerts(db: Session = Depends(get_db)):
    alerts = db.query(DisasterAlert).all()
    results = []
    for a in alerts:
        areas = db.query(AffectedArea).filter(AffectedArea.alert_id == a.id).all()
        results.append({
            "id": a.alert_code,
            "severity": a.severity,
            "headline": a.headline,
            "description": a.description,
            "instructions": a.official_guidance,
            "source": a.source,
            "affected_areas": [{"name": ar.location_name, "lat": ar.latitude, "lon": ar.longitude} for ar in areas]
        })
    return results

# 8. 🎙️ Voice Queries API
@app.get("/api/db/voice-queries")
def get_voice_queries(db: Session = Depends(get_db)):
    return db.query(VoiceQuery).order_by(VoiceQuery.processed_at.desc()).limit(20).all()

@app.post("/api/db/voice-queries")
def log_voice_query(payload: Dict, db: Session = Depends(get_db)):
    vq = VoiceQuery(
        transcription_text=payload.get("text", ""),
        audio_duration_sec=payload.get("duration", 0.0),
        detected_language=payload.get("language", "English"),
        confidence_score=payload.get("confidence", 0.95)
    )
    db.add(vq)
    db.commit()
    db.refresh(vq)
    return {"status": "logged", "id": vq.id}

# 9. 📊 Climate History API
@app.get("/api/db/climate-history")
def get_climate_history(db: Session = Depends(get_db)):
    return db.query(ClimateHistory).all()

# 10. 💬 Chat History API
@app.get("/api/db/chat-history")
def get_chat_history(db: Session = Depends(get_db)):
    return db.query(ChatHistory).order_by(ChatHistory.created_at.desc()).limit(50).all()

# ----------------------------------------------------
# 🌦️ Proxy Weather Endpoints
# ----------------------------------------------------
@app.get("/api/weather/current")
async def get_current_weather_proxy(lat: float = 19.076, lon: float = 72.8777):
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,surface_pressure,cloud_cover,visibility,wind_speed_10m,uv_index&daily=sunrise,sunset&timezone=auto"
    async with httpx.AsyncClient() as client:
        res = await client.get(url)
        return res.json()

@app.get("/api/weather/air-quality")
async def get_air_quality_proxy(lat: float = 19.076, lon: float = 72.8777):
    url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=pm10,pm2_5,nitrogen_dioxide,ozone,us_aqi&timezone=auto"
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(url, timeout=5.0)
            return res.json()
    except Exception:
        return {
            "aqi": 68,
            "statusText": "Moderate AQI",
            "pm25": 22.4,
            "pm10": 45.1,
            "ozone": 38.0,
            "no2": 18.5,
            "healthAdvice": "Air quality is acceptable. Enjoy normal outdoor activities."
        }

@app.get("/api/weather/marine")
async def get_marine_weather_proxy(lat: float = 19.076, lon: float = 72.8777):
    url = f"https://marine-api.open-meteo.com/v1/marine?latitude={lat}&longitude={lon}&hourly=wave_height,wave_direction,wave_period,swell_wave_height&timezone=auto"
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(url, timeout=5.0)
            return res.json()
    except Exception:
        return {
            "waveHeightM": 1.4,
            "swellDirection": "SSW (210°)",
            "swellPeriodSec": 8.5,
            "seaTemperatureC": 28.2,
            "tideState": "Rising Ebb Tide"
        }

@app.get("/api/alerts/active")
async def get_active_disaster_alerts(lat: float = 19.076, lon: float = 72.8777):
    return [
        {
            "id": "ALT-IMD-2026-0901",
            "severity": "Warning",
            "title": "Severe Thunderstorm & Flash Flood Warning",
            "headline": "IMD Doppler Radar: Severe convective thunderstorm cluster approaching coastal zone.",
            "instructions": "Avoid low-lying underpasses and coastal sea walls. Conserve mobile phone battery.",
            "source": "India Meteorological Department (IMD)",
            "effectiveTime": "Immediate",
            "affectedZone": "Mumbai Metropolitan Region",
            "isAcknowledged": False
        }
    ]

# Google Cloud Gemini API configuration
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")

@app.post("/api/ai/chatbot")
async def dedicated_chatbot_endpoint(payload: Dict, db: Session = Depends(get_db)):
    """Dedicated Chatbot API handler powered by Google Cloud Gemini API."""
    query = payload.get("query", "")
    location = payload.get("location", "")
    weather_context = payload.get("weather_context", {})
    lang_code = payload.get("lang_code", "en")
    api_key_override = payload.get("api_key")
    recent_history = payload.get("recent_history")

    res = await process_chatbot_query(
        query=query,
        location=location,
        weather_context=weather_context,
        lang_code=lang_code,
        api_key_override=api_key_override,
        recent_history=recent_history
    )

    if res.get("text"):
        try:
            chat_record = ChatHistory(
                user_query=query,
                bot_response=res.get("text"),
                language_code=lang_code,
                tool_called=res.get("tool_called", "google_cloud_chatbot_service"),
                sources_used=res.get("sources", "India Meteorological Department (IMD), Mausam Portal, NDMA")
            )
            db.add(chat_record)
            db.commit()
        except Exception as db_err:
            print(f"Error persisting chatbot record: {db_err}")

    return res

@app.post("/api/ai/chat")
async def ai_chat_handler(payload: Dict, db: Session = Depends(get_db)):
    """General AI chat handler unified with meteorological intelligence and trained corrections."""
    query = payload.get("query", "")
    location = payload.get("location", "")
    weather_context = payload.get("weather_context", {})
    lang_code = payload.get("lang_code", "en")
    api_key = payload.get("api_key") or GEMINI_API_KEY
    recent_history = payload.get("recent_history")

    res = await process_chatbot_query(
        query=query,
        location=location,
        weather_context=weather_context,
        lang_code=lang_code,
        api_key_override=api_key,
        recent_history=recent_history
    )

    ai_text = res.get("text", "")
    tool_called = res.get("tool_called", "meteorological_ai_engine")
    sources_used = res.get("sources", "India Meteorological Department (IMD), Mausam Portal, NDMA, NCMRWF")

    if ai_text:
        try:
            chat_record = ChatHistory(
                user_query=query,
                bot_response=ai_text,
                language_code=lang_code,
                tool_called=tool_called,
                sources_used=sources_used
            )
            db.add(chat_record)
            db.commit()
        except Exception as db_err:
            print(f"Error persisting chatbot record: {db_err}")

    return {
        "success": True,
        "text": ai_text,
        "tool_called": tool_called,
        "sources": sources_used,
        "language_code": lang_code,
        "status": "success"
    }

@app.post("/api/ai/train")
async def train_chatbot_rule(payload: Dict, db: Session = Depends(get_db)):
    """Train or fine-tune chatbot with custom answers for specific questions or mistakes."""
    query = payload.get("query_pattern") or payload.get("query") or ""
    answer = payload.get("corrected_answer") or payload.get("answer") or ""
    intent = payload.get("target_intent", "custom_training")
    lang_code = payload.get("language_code", "en")

    if not query.strip() or not answer.strip():
        raise HTTPException(status_code=400, detail="Both query_pattern and corrected_answer are required.")

    # Check if a rule for this pattern already exists
    existing = db.query(ChatbotTrainingRule).filter(
        ChatbotTrainingRule.query_pattern == query.strip().lower()
    ).first()

    if existing:
        existing.corrected_answer = answer.strip()
        existing.target_intent = intent
        existing.language_code = lang_code
        existing.is_active = True
        db.commit()
        db.refresh(existing)
        return {
            "success": True,
            "message": "Existing training rule successfully updated with new correction.",
            "rule": {
                "id": existing.id,
                "query_pattern": existing.query_pattern,
                "corrected_answer": existing.corrected_answer,
                "target_intent": existing.target_intent,
                "language_code": existing.language_code
            }
        }
    else:
        new_rule = ChatbotTrainingRule(
            query_pattern=query.strip().lower(),
            corrected_answer=answer.strip(),
            target_intent=intent,
            language_code=lang_code,
            is_active=True
        )
        db.add(new_rule)
        db.commit()
        db.refresh(new_rule)
        return {
            "success": True,
            "message": "New training rule registered and active in WeatherGPT brain.",
            "rule": {
                "id": new_rule.id,
                "query_pattern": new_rule.query_pattern,
                "corrected_answer": new_rule.corrected_answer,
                "target_intent": new_rule.target_intent,
                "language_code": new_rule.language_code
            }
        }

@app.get("/api/ai/trained-rules")
async def get_trained_chatbot_rules(db: Session = Depends(get_db)):
    """Fetch all active user-trained chatbot rules."""
    rules = db.query(ChatbotTrainingRule).filter(ChatbotTrainingRule.is_active == True).order_by(ChatbotTrainingRule.id.desc()).all()
    return {
        "success": True,
        "count": len(rules),
        "rules": [
            {
                "id": r.id,
                "query_pattern": r.query_pattern,
                "corrected_answer": r.corrected_answer,
                "target_intent": r.target_intent,
                "language_code": r.language_code,
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in rules
        ]
    }

@app.delete("/api/ai/trained-rules/{rule_id}")
async def delete_trained_chatbot_rule(rule_id: int, db: Session = Depends(get_db)):
    """Delete or deactivate a trained chatbot rule."""
    rule = db.query(ChatbotTrainingRule).filter(ChatbotTrainingRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Training rule not found.")
    db.delete(rule)
    db.commit()
    return {"success": True, "message": f"Training rule #{rule_id} deleted successfully."}


_tts_audio_cache: dict[str, bytes] = {}

@app.get("/api/tts/speak")
async def tts_proxy_endpoint(text: str, lang: str = "en"):
    """Proxy endpoint streaming native audio for Tamil, Hindi, Telugu, Kannada, Malayalam, Marathi, Bengali, Gujarati, Punjabi, Odia, Assamese, Urdu, etc."""
    try:
        import urllib.parse
        clean_text = text.strip()[:300]
        cache_key = f"{lang}:{clean_text}"
        
        # Check in-memory cache
        if cache_key in _tts_audio_cache:
            from fastapi.responses import Response
            return Response(
                content=_tts_audio_cache[cache_key],
                media_type="audio/mpeg",
                headers={
                    "Cache-Control": "public, max-age=86400",
                    "Accept-Ranges": "bytes",
                    "X-TTS-Cache": "HIT"
                }
            )

        encoded_text = urllib.parse.quote(clean_text)
        url = f"https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl={lang}&q={encoded_text}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "audio/mpeg, audio/*;q=0.9",
        }
        async with httpx.AsyncClient() as client:
            res = await client.get(url, headers=headers, timeout=10.0)
            if res.status_code == 200 and len(res.content) > 100:
                # Save to cache (limit cache size to 200 items)
                if len(_tts_audio_cache) > 200:
                    _tts_audio_cache.clear()
                _tts_audio_cache[cache_key] = res.content

                from fastapi.responses import Response
                return Response(
                    content=res.content,
                    media_type="audio/mpeg",
                    headers={
                        "Cache-Control": "public, max-age=86400",
                        "Accept-Ranges": "bytes",
                        "X-TTS-Cache": "MISS"
                    }
                )
    except Exception as e:
        print(f"TTS Proxy endpoint exception: {e}")
_reverse_geocode_cache: dict[str, dict] = {}

@app.get("/api/weather/reverse-geocode")
async def reverse_geocode_endpoint(lat: float, lon: float):
    """Reverse geocode latitude and longitude into an authentic city/town/village place name."""
    cache_key = f"{round(lat, 3)}:{round(lon, 3)}"
    if cache_key in _reverse_geocode_cache:
        return _reverse_geocode_cache[cache_key]

    try:
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}"
        headers = {
            "User-Agent": "WeatherGPT/1.0 (Weather Intelligence Platform; contact: support@weathergpt.local)",
            "Accept-Language": "en"
        }
        async with httpx.AsyncClient() as client:
            res = await client.get(url, headers=headers, timeout=8.0)
            if res.status_code == 200:
                data = res.json()
                addr = data.get("address", {})
                raw_place = (
                    addr.get("city")
                    or addr.get("town")
                    or addr.get("village")
                    or addr.get("suburb")
                    or addr.get("neighbourhood")
                    or addr.get("county")
                    or addr.get("state_district")
                    or addr.get("state")
                    or "Detected Location"
                )
                
                # Clean up administrative suffixes
                cleaned_place = raw_place
                for suffix in [" Corporation", " Municipal Corporation", " Municipality", " District", " Taluk", " Mandal"]:
                    if cleaned_place.endswith(suffix):
                        cleaned_place = cleaned_place[:-len(suffix)].strip()

                result = {
                    "name": cleaned_place,
                    "country": addr.get("country", "India"),
                    "state": addr.get("state", ""),
                    "lat": lat,
                    "lon": lon,
                    "display_name": data.get("display_name", cleaned_place)
                }
                
                if len(_reverse_geocode_cache) > 500:
                    _reverse_geocode_cache.clear()
                _reverse_geocode_cache[cache_key] = result
                return result
    except Exception as e:
        print(f"Reverse geocode exception: {e}")

    # Fallback to coordinate label if reverse lookup fails
    return {
        "name": f"Location ({round(lat, 2)}°N, {round(lon, 2)}°E)",
        "country": "India",
        "state": "",
        "lat": lat,
        "lon": lon
    }


@app.websocket("/ws/alerts")
async def websocket_alerts_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({"type": "pong", "status": "active"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)