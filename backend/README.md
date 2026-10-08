# ClimaRisk AI - FastAPI Backend Service

This directory contains the production-ready FastAPI backend implementing the complete disaster risk prediction and intelligent early warning API contract for **ClimaRisk AI**.

## Architecture & Features

- **Standard REST API**: Exposes all endpoints matching the frontend client (`/api/weather`, `/api/predictions`, `/api/risk`, `/api/alerts`, `/api/recommendations`, `/api/what-if`, `/api/model-comparison`, `/api/forecast/enso`, `/api/map/risk`, `/api/timeline/{location}`, `/api/vulnerability/{location}`, `/api/lstm/forecast`, etc.).
- **Dataset Grounding**: Embeds the July 2023 10-station multi-variate observations, NOAA Oceanic Niño Index (1950–2026), and Equatorial Pacific Niño 3.4 SST anomalies.
- **External Meteorological Integration**: Queries Open-Meteo for real-time weather observations with automatic fallback to dataset records if the network is disconnected.
- **Configurable Risk Engine**: 6-factor composite scoring engine with configurable weightings and calibrated hazard thresholds (0–20 Very Low, 21–40 Low, 41–60 Moderate, 61–80 High, 81–100 Very High).
- **FastAPI-Ready Client Switch**: The React frontend switches to this backend by setting `VITE_API_MODE=fastapi` and `VITE_API_BASE_URL=http://localhost:8000`.

## Quick Start

### 1. Create Virtual Environment & Install Dependencies

```bash
cd backend
python -m venv venv

# On Linux/macOS:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

pip install -r requirements.txt
```

### 2. Run the Development Server

```bash
uvicorn app.main:app --reload --port 8000
```

The server will be available at:
- **API Base**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc API Reference**: `http://localhost:8000/redoc`

### 3. Connect the Frontend

In the root `.env` or in the application header:
1. Set `VITE_API_MODE=fastapi`
2. Set `VITE_API_BASE_URL=http://localhost:8000`
3. Click the `API: FASTAPI` badge in the header to test live communication.
