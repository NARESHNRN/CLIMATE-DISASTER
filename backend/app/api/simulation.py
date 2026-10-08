from fastapi import APIRouter
from app.schemas.models import WhatIfRequest, WhatIfResponse, WhatIfHazards
from app.services.dataset_service import resolve_location

router = APIRouter(prefix="", tags=["simulation"])

@router.post("/api/what-if", response_model=WhatIfResponse)
@router.post("/api/simulation", response_model=WhatIfResponse)
async def run_simulation(req: WhatIfRequest):
    meta = resolve_location(req.location)
    loc_id = meta["id"]

    baseline = 78.4 if loc_id == "Mumbai" else 74.2 if loc_id == "Delhi" else 45.0

    # Counterfactual physics response calculation
    rainfall_factor = req.rainfallChangePercent * 0.45
    temp_factor = req.temperatureChangeCelsius * 3.8
    river_factor = req.riverLevelChangePercent * 0.35

    delta = rainfall_factor + temp_factor + river_factor
    simulated = max(5.0, min(99.0, baseline + delta))

    sim_flood = max(5.0, min(98.0, 65.0 + req.rainfallChangePercent * 0.6 + req.riverLevelChangePercent * 0.4))
    sim_heat = max(5.0, min(95.0, 40.0 + req.temperatureChangeCelsius * 6.5))
    sim_drought = max(5.0, min(95.0, 35.0 - req.rainfallChangePercent * 0.5 + req.temperatureChangeCelsius * 3.0))

    impact = "Severe" if simulated >= 80 else "High" if simulated >= 65 else "Moderate" if simulated >= 45 else "Low"

    return WhatIfResponse(
        simulation=True,
        location=meta["name"],
        baselineRisk=round(baseline, 1),
        simulatedRisk=round(simulated, 1),
        riskChange=round(simulated - baseline, 1),
        affectedZones=int(max(1, round(simulated / 12))),
        infrastructureImpact=impact,
        message=f"Counterfactual simulation evaluated for {meta['name']}: {delta:+.1f} point risk divergence modeled.",
        disclaimer="SIMULATION — NOT AN OFFICIAL FORECAST",
        simulatedHazards=WhatIfHazards(
            flood=round(sim_flood, 1),
            heat=round(sim_heat, 1),
            drought=round(sim_drought, 1),
        ),
    )
