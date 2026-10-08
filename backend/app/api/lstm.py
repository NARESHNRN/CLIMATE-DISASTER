from fastapi import APIRouter, Query
from app.schemas.models import LstmBackendResponse, LstmStep
from app.services.dataset_service import resolve_location

router = APIRouter(prefix="/api/lstm", tags=["lstm"])

@router.get("/forecast", response_model=LstmBackendResponse)
async def get_lstm_forecast(location: str = Query(default="Chennai")):
    meta = resolve_location(location)

    historical = [
        LstmStep(date="2023-07-19", value=14.2, confidenceLower=12.0, confidenceUpper=16.5),
        LstmStep(date="2023-07-20", value=18.5, confidenceLower=15.8, confidenceUpper=21.2),
        LstmStep(date="2023-07-21", value=32.0, confidenceLower=28.4, confidenceUpper=35.6),
        LstmStep(date="2023-07-22", value=48.2, confidenceLower=43.1, confidenceUpper=53.3),
        LstmStep(date="2023-07-23", value=65.4, confidenceLower=59.0, confidenceUpper=71.8),
        LstmStep(date="2023-07-24", value=84.1, confidenceLower=77.5, confidenceUpper=90.7),
        LstmStep(date="2023-07-25", value=93.9, confidenceLower=87.2, confidenceUpper=100.6),
    ]

    projected = [
        LstmStep(date="2023-07-26 (t+1)", value=78.2, confidenceLower=68.0, confidenceUpper=88.4),
        LstmStep(date="2023-07-27 (t+2)", value=64.5, confidenceLower=52.3, confidenceUpper=76.7),
        LstmStep(date="2023-07-28 (t+3)", value=45.0, confidenceLower=31.5, confidenceUpper=58.5),
        LstmStep(date="2023-07-29 (t+4)", value=32.8, confidenceLower=18.2, confidenceUpper=47.4),
        LstmStep(date="2023-07-30 (t+5)", value=24.1, confidenceLower=9.5, confidenceUpper=38.7),
        LstmStep(date="2023-07-31 (t+6)", value=18.6, confidenceLower=4.2, confidenceUpper=33.0),
        LstmStep(date="2023-08-01 (t+7)", value=12.4, confidenceLower=0.0, confidenceUpper=27.5),
    ]

    important_vars = [
        {"feature": "rainfall_1d", "description": "Single-day flash precipitation pulse (mm)", "weight": 0.38},
        {"feature": "rainfall_7d", "description": "7-day rolling window antecedent moisture accumulation (mm)", "weight": 0.28},
        {"feature": "soil_moisture", "description": "Volumetric soil water layer 0-7cm pore saturation fraction", "weight": 0.18},
        {"feature": "nino34", "description": "Equatorial Pacific Niño 3.4 SST positive anomaly (°C)", "weight": 0.10},
        {"feature": "ndvi", "description": "Normalized Difference Vegetation Index canopy density", "weight": 0.06},
    ]

    return LstmBackendResponse(
        location=meta["name"],
        modelVersion="Bi-LSTM-PyTorch-Architecture-Ready-v2.4",
        forecastLeadDays=7,
        mae=2.14,
        rmse=3.28,
        historicalSequence=historical,
        forecastSequence=projected,
        importantVariables=important_vars,
        disclaimer="DEMO LSTM OUTPUT: Sequence extrapolation structured for FastAPI and PyTorch integration. Not trained PyTorch browser model weights.",
    )
