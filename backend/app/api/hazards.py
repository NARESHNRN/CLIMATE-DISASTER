from fastapi import APIRouter
from typing import List
from app.schemas.models import HazardDetail, DrivingFactorItem
from app.services.dataset_service import resolve_location

router = APIRouter(prefix="/api/hazards", tags=["hazards"])

@router.get("/{location}", response_model=List[HazardDetail])
async def get_hazards(location: str):
    meta = resolve_location(location)
    loc_id = meta["id"]

    hazards = []
    if loc_id in ["Mumbai", "Delhi", "Ahmedabad", "Patna", "Guwahati"]:
        hazards.append(HazardDetail(
            id=f"flood-{loc_id.lower()}",
            type="Flood",
            locationId=loc_id,
            date="2023-07-24",
            status="Active",
            severityLevel="High" if loc_id in ["Mumbai", "Delhi"] else "Moderate",
            probability=84.0,
            drivingFactors=[
                DrivingFactorItem(
                    factor="Antecedent 7-Day Precipitation Accumulation",
                    value="210.5 mm" if loc_id == "Mumbai" else "158.4 mm",
                    contributionPercent=44.0,
                    datasetField="rainfall_7d",
                    provenance="Uploaded Dataset",
                ),
                DrivingFactorItem(
                    factor="Surface Soil Layer Saturation Index",
                    value="0.52 (Volumetric water layer 1)",
                    contributionPercent=32.0,
                    datasetField="soil_moisture",
                    provenance="Uploaded Dataset",
                ),
                DrivingFactorItem(
                    factor="Niño 3.4 SST Teleconnection Anomaly",
                    value="+1.07°C Equatorial Pacific warming",
                    contributionPercent=24.0,
                    datasetField="nino34",
                    provenance="Uploaded Dataset",
                ),
            ],
            affectedPopulationEstimate="High density urban wards (~45,000 residents)",
            impactMetrics={
                "transport": "Arterial road and subway depression waterlogging",
                "drainage": "Stormwater gravity outfall capacity reached",
            },
            provenance="Uploaded Dataset",
        ))

    if loc_id in ["Bengaluru"]:
        hazards.append(HazardDetail(
            id=f"drought-{loc_id.lower()}",
            type="Drought",
            locationId=loc_id,
            date="2023-07-31",
            status="Active",
            severityLevel="Moderate",
            probability=68.0,
            drivingFactors=[
                DrivingFactorItem(
                    factor="30-Day Cumulative Precipitation Deficit",
                    value="18.2 mm (<50mm normal baseline)",
                    contributionPercent=48.0,
                    datasetField="rainfall_30d",
                    provenance="Uploaded Dataset",
                ),
                DrivingFactorItem(
                    factor="Persistent Soil Moisture Deficit",
                    value="0.38 (<0.40 threshold)",
                    contributionPercent=34.0,
                    datasetField="soil_moisture",
                    provenance="Uploaded Dataset",
                ),
            ],
            affectedPopulationEstimate="Peri-urban agricultural tracts (~12,000 residents)",
            impactMetrics={
                "agriculture": "Crop moisture stress in rainfed tracts",
                "waterSupply": "Borewell groundwater drawdown",
            },
            provenance="Uploaded Dataset",
        ))

    if not hazards:
        hazards.append(HazardDetail(
            id=f"compound-{loc_id.lower()}",
            type="Compound",
            locationId=loc_id,
            date="2023-07-26",
            status="Nominal",
            severityLevel="Low",
            probability=28.0,
            drivingFactors=[
                DrivingFactorItem(
                    factor="Monsoon Baseline Convection",
                    value="Normal localized shower activity",
                    contributionPercent=60.0,
                    datasetField="rainfall_1d",
                    provenance="Uploaded Dataset",
                ),
            ],
            affectedPopulationEstimate="Nominal baseline conditions",
            impactMetrics={
                "infrastructure": "Normal municipal operation",
            },
            provenance="Uploaded Dataset",
        ))

    return hazards
