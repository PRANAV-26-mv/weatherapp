from datetime import datetime
from app.database import engine, Base, SessionLocal
from app.models import (
    UserProfile, Location, CurrentWeather, ForecastData,
    DisasterAlert, AffectedArea, NotificationHistory,
    VoiceQuery, ClimateHistory, ChatHistory
)

def init_db():
    print("[DB] Initializing WeatherGPT Database Schema & Tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. User Profile & Preferences Table if empty
        if db.query(UserProfile).count() == 0:
            user = UserProfile(
                username="default_user",
                email="user@weathergpt.ai",
                preferred_language="en",
                theme="dark",
                permanent_location_name="Sathyamangalam",
                permanent_latitude=11.5042,
                permanent_longitude=77.2403
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print("  [+] 1. Seeded UserProfile (users)")
        else:
            user = db.query(UserProfile).first()

        # 2. Locations & Coordinates Table if empty
        if db.query(Location).count() == 0:
            loc1 = Location(
                name="Sathyamangalam",
                country="India",
                state="Tamil Nadu",
                latitude=11.5042,
                longitude=77.2403,
                is_permanent_home=True,
                category="Home",
                user_id=user.id
            )
            loc2 = Location(
                name="Mumbai",
                country="India",
                state="Maharashtra",
                latitude=19.0760,
                longitude=72.8777,
                is_permanent_home=False,
                category="Work",
                user_id=user.id
            )
            db.add_all([loc1, loc2])
            db.commit()
            db.refresh(loc1)
            db.refresh(loc2)
            print("  [+] 2. Seeded Locations (locations)")
        else:
            loc1 = db.query(Location).first()

        # 3. Current Weather Data Table if empty
        if db.query(CurrentWeather).count() == 0:
            weather_snap = CurrentWeather(
                location_id=loc1.id,
                location_name=loc1.name,
                temp_c=36.0,
                feels_like_c=38.5,
                condition_text="Overcast",
                humidity=54,
                wind_speed_kmh=10.0,
                wind_direction_deg=315.0,
                wind_direction_text="NW",
                pressure_hpa=986.0,
                uv_index=6.5,
                cloud_cover_pct=85,
                visibility_km=10.0,
                sunrise="06:08 AM",
                sunset="06:34 PM"
            )
            db.add(weather_snap)
            db.commit()
            print("  [+] 3. Seeded Current Weather (current_weather)")

        # 4. Forecast Data Table if empty
        if db.query(ForecastData).count() == 0:
            f1 = ForecastData(
                location_id=loc1.id,
                forecast_type="daily",
                forecast_date="2026-09-07",
                time_or_day="Today",
                temp_c=36.0,
                max_temp_c=37.2,
                min_temp_c=24.5,
                rain_probability_pct=25,
                precipitation_mm=0.5,
                condition_text="Partly Cloudy",
                wind_speed_kmh=12.0
            )
            f2 = ForecastData(
                location_id=loc1.id,
                forecast_type="daily",
                forecast_date="2026-09-08",
                time_or_day="Tomorrow",
                temp_c=34.5,
                max_temp_c=35.0,
                min_temp_c=23.8,
                rain_probability_pct=60,
                precipitation_mm=4.2,
                condition_text="Thunderstorms Expected",
                wind_speed_kmh=18.0
            )
            db.add_all([f1, f2])
            db.commit()
            print("  [+] 4. Seeded Forecast Data (forecast_data)")

        # 5. Disaster Alerts Table if empty
        if db.query(DisasterAlert).count() == 0:
            alert = DisasterAlert(
                alert_code="ALT-IMD-2026-0901",
                hazard_type="Severe Thunderstorm & Flash Flood",
                severity="Warning",
                status="active",
                source="India Meteorological Department (IMD)",
                source_url="https://mausam.imd.gov.in",
                headline="IMD Radar Alert: Severe convective cluster approaching western region.",
                description="Heavy downpours expected with lightning strikes and local urban waterlogging.",
                official_guidance="Avoid low-lying underpasses and stay indoors during thunderstorm activity.",
                radius_km=50.0
            )
            db.add(alert)
            db.commit()
            db.refresh(alert)
            print("  [+] 5. Seeded Disaster Alert (disaster_alerts)")

            # 6. Affected Areas Table
            if db.query(AffectedArea).count() == 0:
                area = AffectedArea(
                    alert_id=alert.id,
                    location_name="Western Ghats Corridor",
                    latitude=11.5042,
                    longitude=77.2403,
                    radius_km=50.0,
                    polygon_geojson='{"type": "Point", "coordinates": [77.2403, 11.5042]}'
                )
                db.add(area)
                db.commit()
                print("  [+] 6. Seeded Affected Area (affected_areas)")

            # 7. Notification History Table
            if db.query(NotificationHistory).count() == 0:
                notif = NotificationHistory(
                    user_id=user.id,
                    alert_id=alert.id,
                    notification_type="push",
                    recipient_contact="user@weathergpt.ai",
                    message_content="ALERT: Thunderstorm warning issued for your pinned home region.",
                    status="sent"
                )
                db.add(notif)
                db.commit()
                print("  [+] 7. Seeded Notification History (notification_history)")

        # 8. Voice Queries Table if empty
        if db.query(VoiceQuery).count() == 0:
            vq = VoiceQuery(
                user_id=user.id,
                audio_duration_sec=3.5,
                transcription_text="what is weather in sathymagalam",
                detected_language="English / Tamil",
                locale_code="en-IN",
                confidence_score=0.98
            )
            db.add(vq)
            db.commit()
            print("  [+] 8. Seeded Voice Query Transcriptions (voice_queries)")

        # 9. Climate History Table if empty
        if db.query(ClimateHistory).count() == 0:
            ch = ClimateHistory(
                location_id=loc1.id,
                record_date="2026-08-30",
                avg_temp_c=29.4,
                max_temp_c=35.1,
                min_temp_c=23.2,
                total_precipitation_mm=12.4,
                anomaly_rating="+0.8C Above 30-yr Average"
            )
            db.add(ch)
            db.commit()
            print("  [+] 9. Seeded Historical Climate Data (climate_history)")

        # 10. Chat History Table if empty
        if db.query(ChatHistory).count() == 0:
            chat = ChatHistory(
                user_id=user.id,
                session_id="session-001",
                user_query="what is weather in sathymagalam",
                bot_response="The current temperature in Sathyamangalam is 36C with overcast skies. Humidity is 54%.",
                language_code="en",
                tool_called="get_current_weather(Sathyamangalam)",
                sources_used="Open-Meteo, IMD Radar"
            )
            db.add(chat)
            db.commit()
            print("  [+] 10. Seeded Chat History (chat_history)")

        print("[DB] Database Initialization Completed Successfully!")
    except Exception as e:
        db.rollback()
        print(f"[DB] Error initializing database seed data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
