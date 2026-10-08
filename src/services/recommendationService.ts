import { DatasetAdapter } from './datasetAdapter';
import { RoleType, RoleRecommendationResponse, ApiResponse } from '../data/types';
import { apiCache } from './cache';

export class RecommendationService {
  /**
   * GET /api/recommendations?location={location}&role={role}
   * Generates actionable decision-support guidelines tailored by audience role.
   */
  public static async getRecommendations(
    locationName?: string,
    role: RoleType = 'resident'
  ): Promise<ApiResponse<RoleRecommendationResponse>> {
    const meta = DatasetAdapter.resolveLocation(locationName);
    const cacheKey = apiCache.buildKey('/api/recommendations', meta.id, { role });

    const cached = apiCache.get<ApiResponse<RoleRecommendationResponse>>(cacheKey);
    if (cached) return { ...cached, cached: true };

    const records = DatasetAdapter.getLocationRecords(meta.id);
    const peakRec = records.reduce((prev, curr) => (curr.rainfall1d > prev.rainfall1d ? curr : prev), records[0]);

    const isFloodRisk = peakRec.rainfall1d > 35 || peakRec.rainfall7d > 140 || records.some((r) => r.floodLabel === 1);
    const isHeatRisk = peakRec.temperatureMax > 33.5;
    const isDroughtRisk = records.some((r) => r.droughtLabel === 1);

    const primaryHazard = isFloodRisk ? 'Inundation / Flooding' : isHeatRisk ? 'Extreme Thermal Stress' : isDroughtRisk ? 'Hydrological Deficit' : 'Seasonal Monsoon Rain';
    const riskLevel = isFloodRisk ? 'High' : isHeatRisk ? 'Moderate' : isDroughtRisk ? 'Moderate' : 'Low';

    let recommendations: string[] = [];

    switch (role) {
      case 'resident':
        if (isFloodRisk) {
          recommendations = [
            'Avoid driving or walking through flooded low-lying underpasses and waterlogged roads.',
            'Prepare sealed drinking water reserves, emergency non-perishable rations, and first-aid kits.',
            'Fully charge essential communication devices and power banks.',
            'Move valuable documentation, electronics, and livestock to upper floor levels.',
            'Monitor official State Disaster Management Authority and IMD meteorological bulletins.',
          ];
        } else if (isHeatRisk) {
          recommendations = [
            'Avoid direct sun exposure between 11:30 AM and 3:30 PM.',
            'Consume frequent electrolyte fluids and carry water during essential transit.',
            'Check on elderly neighbors, outdoor delivery workers, and pets.',
            'Keep living spaces ventilated or utilize designated municipal cool-roof shelters.',
          ];
        } else {
          recommendations = [
            'Conserve municipal tap water and inspect rainwater harvesting sump filters.',
            'Report blocked neighborhood storm gutters or sewer chokes to municipal ward officers.',
            'Stay updated on localized weather advisory alerts.',
          ];
        }
        break;

      case 'authority':
        if (isFloodRisk) {
          recommendations = [
            'Inspect urban storm drains, outfall gates, and automated pumping stations in vulnerable wards.',
            'Designate and prepare relief shelters with clean bedding, sanitation, and power backup.',
            'Pre-position State Disaster Response teams and rubberized inflatable rescue boats.',
            'Establish continuous monitoring on river gauge crests and lake weir discharge levels.',
            'Pre-position emergency sandbags, temporary bunds, and diesel dewatering pump sets.',
          ];
        } else if (isHeatRisk) {
          recommendations = [
            'Open public urban cooling shelters at high-density bus terminals and railway stations.',
            'Mandate mid-day work rest intervals for construction and municipal sanitation workers.',
            'Coordinate with power discoms to prevent localized transformer overloads.',
          ];
        } else {
          recommendations = [
            'Review surface reservoir storage curves and enforce canal irrigation scheduling.',
            'Audit deep borewell recharge telemetry across peri-urban water supply belts.',
          ];
        }
        break;

      case 'farmer':
        if (isFloodRisk) {
          recommendations = [
            'Clear field drainage furrows to prevent water stagnation in standing Kharif seedlings.',
            'Postpone planned top-dressing fertilizer and pesticide spraying ahead of the heavy rain pulse.',
            'Relocate harvested produce and farm machinery to elevated, waterproof storage sheds.',
            'Move cattle and small ruminants away from low-lying riparian pasture grounds.',
          ];
        } else if (isDroughtRisk) {
          recommendations = [
            'Adopt drip and micro-sprinkler irrigation schedules during dawn and dusk hours.',
            'Apply biomass mulch across crop root zones to minimize evaporative topsoil loss.',
            'Consider drought-tolerant contingency millets or short-duration pulses.',
          ];
        } else {
          recommendations = [
            'Monitor soil moisture levels before scheduling weekly irrigation cycles.',
            'Inspect bund integrity across terraced farm plots.',
          ];
        }
        break;

      case 'hospital':
        recommendations = [
          'Verify auxiliary diesel generator backup and fuel reserves for uninterrupted ICU/OT power.',
          'Stock oral rehydration salts (ORS), intravenous fluids, and waterborne disease antibiotics.',
          'Inspect basement level medical storage and ensure elevation above flood crest levels.',
          'Establish rapid triage protocols for heat exhaustion and monsoon trauma admissions.',
          'Coordinate ambulance access rerouting around known road waterlogging hotspots.',
        ];
        break;
    }

    const data: RoleRecommendationResponse = {
      location: meta.name,
      role,
      riskLevel,
      hazard: primaryHazard,
      recommendations,
      typeLabel: 'Decision-support recommendations',
      dataMode: 'demo',
    };

    const result: ApiResponse<RoleRecommendationResponse> = {
      success: true,
      data,
      dataMode: 'demo',
      timestamp: new Date().toISOString(),
    };

    apiCache.set(cacheKey, result, 120);
    return result;
  }
}
