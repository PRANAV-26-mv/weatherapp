import os
from pathlib import Path
# pyrefly: ignore [missing-import]
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load .env file from backend root if present
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
        print(f"Error reading .env in database.py: {e}")

# PostgreSQL connection string priority:
# 1. POSTGRESQL_URL / DATABASE_URL from environment (.env or Cloud Provider)
# 2. Local PostgreSQL default: postgresql://postgres:postgres@localhost:5432/weathergpt
# 3. Fallback: sqlite:///./weathergpt.db (for instant local zero-config execution)

DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("POSTGRESQL_URL")

if not DATABASE_URL:
    DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/weathergpt"

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

def get_engine_and_db_url(url: str):
    connect_args = {}
    if "sqlite" in url:
        connect_args = {"check_same_thread": False}
    
    eng = create_engine(url, connect_args=connect_args, pool_pre_ping=True)
    # Test connection if PostgreSQL
    if "postgresql" in url:
        try:
            with eng.connect() as conn:
                pass
            print(f"[DB] PostgreSQL connected successfully to: {url.split('@')[-1] if '@' in url else url}")
            return eng, url
        except Exception as err:
            print(f"[DB] PostgreSQL connection refused or offline. Falling back to SQLite database.")
            fallback_url = "sqlite:///./weathergpt.db"
            eng_fb = create_engine(fallback_url, connect_args={"check_same_thread": False}, pool_pre_ping=True)
            print(f"[DB] SQLite Database connected: {fallback_url}")
            return eng_fb, fallback_url
    else:
        print(f"[DB] SQLite Database connected: {url}")
        return eng, url

engine, ACTIVE_DATABASE_URL = get_engine_and_db_url(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
