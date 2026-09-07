from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

# 1. 👤 User Profiles & Preferences Table
class UserProfile(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    preferred_language = Column(String(10), default="en")
    theme = Column(String(10), default="dark")
    permanent_location_name = Column(String(150), nullable=True)
    permanent_latitude = Column(Float, nullable=True)
    permanent_longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    locations = relationship("Location", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("NotificationHistory", back_populates="user")
    voice_queries = relationship("VoiceQuery", back_populates="user")
    chat_messages = relationship("ChatHistory", back_populates="user")


# 2. 📍 Locations & Coordinates Table
class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), index=True, nullable=False)
    country = Column(String(100), default="India")
    state = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    is_permanent_home = Column(Boolean, default=False)
    alert_radius_km = Column(Integer, default=50)
    category = Column(String(50), default="Home") # Home, College, Work, Farm, Custom
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("UserProfile", back_populates="locations")
    weather_snapshots = relationship("CurrentWeather", back_populates="location", cascade="all, delete-orphan")
    forecasts = relationship("ForecastData", back_populates="location", cascade="all, delete-orphan")
    climate_records = relationship("ClimateHistory", back_populates="location", cascade="all, delete-orphan")


# 3. 🌦️ Current Weather Data Snapshot Table
class CurrentWeather(Base):
    __tablename__ = "current_weather"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    location_name = Column(String(150), nullable=False)
    temp_c = Column(Float, nullable=False)
    feels_like_c = Column(Float, nullable=False)
    condition_text = Column(String(100), nullable=False)
    condition_code = Column(Integer, default=1)
    humidity = Column(Integer, nullable=False)
    wind_speed_kmh = Column(Float, nullable=False)
    wind_direction_deg = Column(Float, default=0.0)
    wind_direction_text = Column(String(20), default="N")
    pressure_hpa = Column(Float, nullable=False)
    uv_index = Column(Float, default=5.0)
    cloud_cover_pct = Column(Integer, default=40)
    visibility_km = Column(Float, default=10.0)
    sunrise = Column(String(20), nullable=True)
    sunset = Column(String(20), nullable=True)
    fetched_at = Column(DateTime, default=datetime.utcnow)

    location = relationship("Location", back_populates="weather_snapshots")


# 4. 🔮 Forecast Data Table (Hourly & Daily)
class ForecastData(Base):
    __tablename__ = "forecast_data"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    forecast_type = Column(String(20), default="daily") # 'hourly' or 'daily'
    forecast_date = Column(String(30), nullable=False)
    time_or_day = Column(String(30), nullable=False) # e.g. "14:00" or "Mon"
    temp_c = Column(Float, nullable=True)
    max_temp_c = Column(Float, nullable=True)
    min_temp_c = Column(Float, nullable=True)
    rain_probability_pct = Column(Integer, default=0)
    precipitation_mm = Column(Float, default=0.0)
    condition_text = Column(String(100), nullable=False)
    wind_speed_kmh = Column(Float, default=10.0)
    uv_index = Column(Float, default=5.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    location = relationship("Location", back_populates="forecasts")


# 5. 🚨 Disaster Alerts Table
class DisasterAlert(Base):
    __tablename__ = "disaster_alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_code = Column(String(100), unique=True, index=True, nullable=False)
    hazard_type = Column(String(150), nullable=False)
    severity = Column(String(30), default="warning") # 'warning', 'advisory', 'emergency'
    status = Column(String(30), default="active")
    source = Column(String(150), default="India Meteorological Department (IMD)")
    source_url = Column(String(255), nullable=True)
    headline = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    official_guidance = Column(Text, nullable=True)
    radius_km = Column(Float, default=50.0)
    issued_at = Column(DateTime, default=datetime.utcnow)
    expiration_at = Column(DateTime, nullable=True)

    affected_areas = relationship("AffectedArea", back_populates="alert", cascade="all, delete-orphan")
    notifications = relationship("NotificationHistory", back_populates="alert")


# 6. 🗺️ Affected Areas Table
class AffectedArea(Base):
    __tablename__ = "affected_areas"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("disaster_alerts.id"), nullable=False)
    location_name = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    radius_km = Column(Float, default=50.0)
    polygon_geojson = Column(Text, nullable=True)

    alert = relationship("DisasterAlert", back_populates="affected_areas")


# 7. 🔔 Notification History Table
class NotificationHistory(Base):
    __tablename__ = "notification_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    alert_id = Column(Integer, ForeignKey("disaster_alerts.id"), nullable=True)
    notification_type = Column(String(30), default="push") # 'sms', 'whatsapp', 'push'
    recipient_contact = Column(String(100), nullable=False)
    message_content = Column(Text, nullable=False)
    status = Column(String(30), default="sent") # 'sent', 'failed', 'delivered'
    sent_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("UserProfile", back_populates="notifications")
    alert = relationship("DisasterAlert", back_populates="notifications")


# 8. 🎙️ Voice-Query Transcriptions and Metadata Table
class VoiceQuery(Base):
    __tablename__ = "voice_queries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    audio_duration_sec = Column(Float, default=0.0)
    transcription_text = Column(Text, nullable=False)
    detected_language = Column(String(50), default="English")
    locale_code = Column(String(20), default="en-IN")
    confidence_score = Column(Float, default=0.95)
    processed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("UserProfile", back_populates="voice_queries")


# 9. 📊 Historical / Climate Data Table
class ClimateHistory(Base):
    __tablename__ = "climate_history"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    record_date = Column(String(30), nullable=False)
    avg_temp_c = Column(Float, nullable=False)
    max_temp_c = Column(Float, nullable=False)
    min_temp_c = Column(Float, nullable=False)
    total_precipitation_mm = Column(Float, default=0.0)
    anomaly_rating = Column(String(50), default="Normal Range")
    recorded_at = Column(DateTime, default=datetime.utcnow)

    location = relationship("Location", back_populates="climate_records")


# 10. 💬 Chat / Query History Table
class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id = Column(String(100), index=True, default="default-session")
    user_query = Column(Text, nullable=False)
    bot_response = Column(Text, nullable=False)
    language_code = Column(String(10), default="en")
    tool_called = Column(String(100), nullable=True)
    sources_used = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("UserProfile", back_populates="chat_messages")
