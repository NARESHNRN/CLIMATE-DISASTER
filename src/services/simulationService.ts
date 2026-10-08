import { DatasetAdapter } from './datasetAdapter';
import { WhatIfRequest, WhatIfResponse, ApiResponse } from '../data/types';
import { RiskService } from './riskService';

export class SimulationService {
  /**
   * POST /api/what-if
   * Executes a counterfactual scenario query.
   * Clearly stamped with: "SIMULATION — NOT AN OFFICIAL FORECAST"
   */
  public static async runWhatIf(request: WhatIfRequest): Promise<ApiResponse<WhatIfResponse>> {
    const meta = DatasetAdapter.resolveLocation(request.location);

    // Retrieve baseline risk
    const baselineRiskRes = await RiskService.getRisk(meta.id);
    const baselineRisk = baselineRiskRes.data.overallRiskScore;

    // Simulate scenario perturbations
    const rainFactor = 1 + (request.rainfallChangePercent || 0) / 100;
    const tempDelta = request.temperatureChangeCelsius || 0;
    const riverFactor = 1 + (request.riverLevelChangePercent || 0) / 100;

    // Compute simulated delta
    let riskDelta = 0;
    if (request.rainfallChangePercent > 0) {
      riskDelta += Math.round((request.rainfallChangePercent / 10) * 4.2);
    } else {
      riskDelta += Math.round((request.rainfallChangePercent / 10) * 3.0);
    }

    if (request.riverLevelChangePercent > 0) {
      riskDelta += Math.round((request.riverLevelChangePercent / 10) * 3.5);
    }

    if (tempDelta > 0) {
      riskDelta += Math.round(tempDelta * 4.0);
    }

    const simulatedRisk = Math.max(10, Math.min(99, baselineRisk + riskDelta));
    const netRiskChange = simulatedRisk - baselineRisk;

    // Calculate affected urban zones (1 - 12 zones)
    const affectedZones = Math.min(12, Math.max(1, Math.round((simulatedRisk / 100) * 10)));

    let infrastructureImpact: 'Low' | 'Moderate' | 'High' | 'Severe' = 'Low';
    if (simulatedRisk >= 80) infrastructureImpact = 'Severe';
    else if (simulatedRisk >= 65) infrastructureImpact = 'High';
    else if (simulatedRisk >= 45) infrastructureImpact = 'Moderate';

    let message = '';
    if (netRiskChange > 0) {
      message = `Hazard exposure intensifies by ${netRiskChange}% points across ${meta.name} under the simulated +${request.rainfallChangePercent}% precipitation / +${request.riverLevelChangePercent}% river crest scenario.`;
    } else if (netRiskChange < 0) {
      message = `Hazard pressure recedes by ${Math.abs(netRiskChange)}% points in ${meta.name} under the simulated scenario conditions.`;
    } else {
      message = `Simulated parameters produce neutral deviation from current baseline risk levels in ${meta.name}.`;
    }

    const data: WhatIfResponse = {
      simulation: true,
      location: meta.name,
      baselineRisk,
      simulatedRisk,
      riskChange: netRiskChange,
      affectedZones,
      infrastructureImpact,
      message,
      disclaimer: 'SIMULATION — NOT AN OFFICIAL FORECAST',
      simulatedHazards: {
        flood: Math.min(98, Math.round(baselineRiskRes.data.risks.flood.score * rainFactor * riverFactor)),
        heat: Math.min(96, Math.round(baselineRiskRes.data.risks.heatwave.score + tempDelta * 6)),
        drought: Math.min(94, Math.max(10, Math.round(baselineRiskRes.data.risks.drought.score * (1 / Math.max(0.5, rainFactor))))),
      },
    };

    return {
      success: true,
      data,
      dataMode: 'demo',
      timestamp: new Date().toISOString(),
    };
  }
}
