# 🌤️ WeatherGPT - AI Meteorological Intelligence Platform

An advanced AI-powered weather intelligence platform powered by **WeatherGPT AI Engine (NLU & Multimodal Vision)**, live **Open-Meteo & IMD telemetry**, **13 Indian languages speech engine**, **disaster warning geofencing**, and **permanent location persistence**.

---

## 🚀 Live GitHub Repository
**URL**: [https://github.com/PRANAV-26-mv/weatherapp.git](https://github.com/PRANAV-26-mv/weatherapp.git)

---

## 🌐 Deployment Options (100% Free Hosting)

### ⚡ Option 1: Deploy Frontend on Vercel (Recommended - 1 Click)

1. Go to **[Vercel.com](https://vercel.com)** and sign in with GitHub.
2. Click **"Add New"** → **"Project"**.
3. Import your repository: `PRANAV-26-mv/weatherapp`.
4. Configure Build Settings:
   - **Root Directory**: `./` (or `frontend`)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
5. Add Environment Variables (Optional):
   - `VITE_GEMINI_API_KEY`: `AIzaSy...` (Your Google Cloud Gemini Key)
6. Click **Deploy**! Your site will be live at `https://weatherapp-xxx.vercel.app` in under 60 seconds.

---

### 🐍 Option 2: Deploy FastAPI Backend on Render.com (Free)

1. Go to **[Render.com](https://render.com)** and sign in with GitHub.
2. Click **"New +"** → **"Web Service"**.
3. Connect repository: `PRANAV-26-mv/weatherapp`.
4. Configure Settings:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variable:
   - `GOOGLE_API_KEY`: `AIzaSy...`
6. Click **Create Web Service**. Your backend API will be live at `https://weatherapp-backend.onrender.com`.

---

### 🟢 Option 3: Deploy Frontend on Netlify

1. Go to **[Netlify.com](https://netlify.com)** and import `PRANAV-26-mv/weatherapp`.
2. Set **Base directory**: `frontend`
3. Set **Build command**: `npm run build`
4. Set **Publish directory**: `frontend/dist`
5. Click **Deploy Site**.

---

## 💻 Local Development Setup

### 1. Frontend (React + Vite + Tailwind)
```bash
cd frontend
npm install
npm run dev
```
Runs at: `http://localhost:5173/`

### 2. Backend (FastAPI + Uvicorn)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000 --reload
```
Runs at: `http://localhost:8000/`

---

## ✨ Features
- 🧠 **WeatherGPT AI Engine**: Direct Generative NLU for weather Q&A.
- 📷 **Multimodal Weather Vision AI**: Upload or snap sky/cloud/radar photos for AI risk analysis.
- 🎙️ **Multilingual Speech Engine**: Initial language modal + WebSpeech STT/TTS in 13 Indian languages.
- 🏠 **Permanent Location Persistence**: Auto-saves selected home town (e.g. Sathyamangalam) across reloads.
- 🎯 **Fuzzy Location Resolution**: Maps typos (e.g., `sathymagalam` → Sathyamangalam).
- 🚨 **IMD & NDMA Disaster Warnings**: Live alert geofencing, WhatsApp/SMS broadcast sharing.
- 📱 **Mobile Optimized**: Custom floating input bar, search drawer, and touch controls.
