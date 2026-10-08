from fastapi import APIRouter
from app.schemas.models import EnsoApiResponseData, EnsoRecord, OniRecord

router = APIRouter(prefix="/api/forecast", tags=["enso"])

@router.get("/enso", response_model=EnsoApiResponseData)
async def get_enso_forecast():
    # Sample slice of historical ENSO SST anomalies from uploaded dataset
    hist_enso = [
        EnsoRecord(year=2021, month=7, nino12=21.2, nino12Anom=-0.4, nino3=25.4, nino3Anom=-0.5, nino4=28.4, nino4Anom=-0.3, nino34=26.8, nino34Anom=-0.45),
        EnsoRecord(year=2022, month=7, nino12=20.8, nino12Anom=-0.8, nino3=25.1, nino3Anom=-0.8, nino4=28.1, nino4Anom=-0.6, nino34=26.4, nino34Anom=-0.85),
        EnsoRecord(year=2023, month=7, nino12=24.5, nino12Anom=2.8, nino3=27.2, nino3Anom=1.3, nino4=29.4, nino4Anom=0.7, nino34=28.3, nino34Anom=1.07),
        EnsoRecord(year=2024, month=7, nino12=21.4, nino12Anom=-0.2, nino3=25.6, nino3Anom=-0.3, nino4=28.6, nino4Anom=-0.1, nino34=27.0, nino34Anom=-0.25),
        EnsoRecord(year=2025, month=7, nino12=21.6, nino12Anom=0.0, nino3=25.8, nino3Anom=-0.1, nino4=28.8, nino4Anom=0.1, nino34=27.2, nino34Anom=-0.05),
    ]

    hist_oni = [
        OniRecord(season="AMJ", year=2023, total=28.2, anom=0.5, phase="El Niño"),
        OniRecord(season="MJJ", year=2023, total=28.5, anom=0.8, phase="El Niño"),
        OniRecord(season="JJA", year=2023, total=28.8, anom=1.0, phase="El Niño"),
        OniRecord(season="JAS", year=2023, total=29.0, anom=1.1, phase="El Niño"),
        OniRecord(season="ASO", year=2023, total=29.2, anom=1.3, phase="El Niño"),
        OniRecord(season="SON", year=2023, total=29.4, anom=1.5, phase="El Niño"),
    ]

    return EnsoApiResponseData(
        currentOni=1.0,
        currentNino34=1.07,
        currentPhase="Moderate-to-Strong El Niño (+1.07°C SST anomaly)",
        historicalEnso=hist_enso,
        seasonalOni=hist_oni,
        teleconnectionEffect="Equatorial Pacific warming suppresses Walker Circulation, causing localized precipitation anomalies, heightened flash-flood pulses in coastal/monsoon zones, and precipitation deficits in south-interior peninsular India.",
        sourceDataset="Uploaded Dataset: enso_sst_dataset.csv & oni_dataset.csv",
    )
