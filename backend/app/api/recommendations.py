from fastapi import APIRouter, Query
from app.schemas.models import RoleRecommendationResponse
from app.services.dataset_service import resolve_location

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

def generate_recommendations(loc_name: str, role: str) -> RoleRecommendationResponse:
    meta = resolve_location(loc_name)
    loc_id = meta["id"]
    is_flood = loc_id in ["Mumbai", "Delhi", "Ahmedabad", "Patna", "Guwahati"]
    is_drought = loc_id in ["Bengaluru"]
    is_heat = loc_id in ["Hyderabad"]

    hazard = "Inundation & Urban Flooding" if is_flood else "Hydrological Deficit / Dry-Spell" if is_drought else "Extreme Thermal Stress" if is_heat else "Seasonal Monsoonal Pattern"
    risk_level = "High" if is_flood else "Moderate"

    recs = []
    if role == "resident":
        if is_flood:
            recs = [
                "Avoid driving or walking through flooded low-lying underpasses and waterlogged roads.",
                "Prepare sealed drinking water reserves, emergency non-perishable rations, and first-aid kits.",
                "Fully charge essential communication devices and backup power banks.",
                "Move valuable documentation, electronics, and livestock to upper floor levels.",
                "Monitor official State Disaster Management Authority and IMD meteorological bulletins.",
            ]
        elif is_heat:
            recs = [
                "Avoid direct sun exposure between 11:30 AM and 3:30 PM.",
                "Consume frequent electrolyte fluids and carry water during transit.",
                "Check on elderly neighbors, outdoor delivery workers, and pets.",
                "Keep living spaces ventilated or utilize designated municipal cool-roof shelters.",
            ]
        else:
            recs = [
                "Conserve municipal tap water and inspect rainwater harvesting sump filters.",
                "Report blocked neighborhood storm gutters or sewer chokes to municipal ward officers.",
                "Stay updated on localized weather advisory alerts.",
            ]
    elif role == "authority":
        if is_flood:
            recs = [
                "Mobilize municipal high-capacity dewatering pumps to designated depression hotspots.",
                "Deploy quick-response rescue squads and inflatable boats along riparian settlement buffers.",
                "Inspect sluice gates, storm drainage outfalls, and retention pond freeboards.",
                "Issue traffic diversions around waterlogged arterial road junctions.",
            ]
        else:
            recs = [
                "Review municipal emergency reservoir storage and groundwater pumping readiness.",
                "Coordinate with civil defense and health departments for heat/flood relief centers.",
                "Ensure emergency communications failover channels are operational.",
            ]
    elif role == "farmer":
        if is_flood:
            recs = [
                "Clear field peripheral drainage channels to avoid standing crop waterlogging and root rot.",
                "Secure harvested grain sacks on elevated dry storage pallets.",
                "Temporarily relocate livestock and pump motors away from low-lying riparian fields.",
            ]
        elif is_drought:
            recs = [
                "Adopt micro-drip irrigation and apply organic soil mulch to preserve soil moisture.",
                "Delay nitrogenous fertilizer application until verified soil moisture replenishment.",
                "Plan contingency short-duration drought-resilient pulse or millet varieties.",
            ]
        else:
            recs = [
                "Monitor soil moisture tension before scheduling secondary crop irrigation cycles.",
                "Check field bunds to harvest anticipated monsoon precipitation efficiently.",
            ]
    else:  # hospital
        recs = [
            "Test auxiliary diesel backup generator systems and fuel reserves against grid outages.",
            "Stock intravenous rehydration fluids, anti-snake venom, and waterborne disease medications.",
            "Verify basement oxygen plant flood barriers and submersible sump pumps.",
            "Prepare emergency medical surge teams for trauma and vector-borne illness triage.",
        ]

    return RoleRecommendationResponse(
        location=meta["name"],
        role=role,
        riskLevel=risk_level,
        hazard=hazard,
        recommendations=recs,
        typeLabel="Decision-support recommendations",
        dataMode="demo",
    )

@router.get("", response_model=RoleRecommendationResponse)
async def get_recs_query(
    location: str = Query(default="Chennai"),
    role: str = Query(default="resident")
):
    return generate_recommendations(location, role)

@router.get("/{location}", response_model=RoleRecommendationResponse)
async def get_recs_path(
    location: str,
    role: str = Query(default="resident")
):
    return generate_recommendations(location, role)
