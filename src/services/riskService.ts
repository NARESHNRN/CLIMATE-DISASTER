import { DatasetAdapter } from './datasetAdapter';
import { RiskApiResponse, ApiResponse } from '../data/types';
import { apiCache } from './cache';

export interface RiskEngineWeights {
  climateSignal: number;       // default: 0.15 (ENSO/ONI teleconnection)
  weatherConditions: number;   // default: 0.35 (Precipitation & Thermal peaks)
  environmentalConditions: number; // default: 0.20 (Soil moisture, NDVI)
  historicalRisk: number;      // default: 0.15 (Dataset ground truth frequency)
  exposure: number;            // default: 0.10 (Urban density / low elevation)
  vulnerability: number;       // default: 0.05 (Drainage infrastructure capacity)
}

export const DEFAULT_RISK_WEIGHTS: RiskEngineWeights = {
  climateSignal: 0.15,
  weatherConditions: 0.35,
  environmentalConditions: 0.20,
  historicalRisk: 0.15,
  exposure: 0.10,
  vulnerability: 0.05,
};

export class RiskService {
  /**
   * Configurable threshold mapping:
   * 0–20: Very Low, 21–40: Low, 41–60: Moderate, 61–80: High, 81–100: Very High
   * Note: Project-defined demonstration thresholds, not universal scientific standards.
   */
  public static categorizeRiskLevel(score: number): 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High' {
    if (score <= 20) return 'Very Low';
    if (score <= 40) return 'Low';
    if (score <= 60) return 'Moderate';
    if (score <= 80) return 'High';
    return 'Very High';
  }

  /**
   * GET /api/risk?location={location}
   */
  public static async getRisk(
    locationName?: string,
    customWeights: RiskEngineWeights = DEFAULT_RISK_WEIGHTS
  ): Promise<ApiResponse<RiskApiResponse>> {
    const meta = DatasetAdapter.resolveLocation(locationName);
    const cacheKey = apiCache.buildKey('/api/risk', meta.id, customWeights as unknown as Record<string, unknown>);

    const cached = apiCache.get<ApiResponse<RiskApiResponse>>(cacheKey);
    if (cached) return { ...cached, cached: true };

    const records = DatasetAdapter.getLocationRecords(meta.id);
    const peakRec = records.reduce((prev, curr) => (curr.rainfall1d > prev.rainfall1d ? curr : prev), records[0]);
    const latestRec = records[records.length - 1] || peakRec;

    const floodCount = records.filter((r) => r.floodLabel === 1).length;
    const droughtCount = records.filter((r) => r.droughtLabel === 1).length;
    const heatCount = records.filter((r) => r.heatLabel === 1).length;

    // Component score calculation (0 - 100 scales)
    const climateSignalScore = Math.min(100, Math.round((peakRec.nino34 / 2.0) * 100)); // +1.07 Nino3.4 -> ~53.5
    const weatherScore = Math.min(100, Math.round((peakRec.rainfall1d / 90) * 60 + (peakRec.temperatureMax / 40) * 40));
    const envScore = Math.min(100, Math.round((peakRec.soilMoisture / 0.5) * 60 + (1 - peakRec.ndvi) * 40));
    const historicalScore = Math.min(100, (floodCount * 12) + (droughtCount * 10) + (heatCount * 15));
    const exposureScore = meta.id.toLowerCase() === 'chennai' || meta.id.toLowerCase() === 'mumbai' ? 84 : 68;
    const vulnScore = 72;

    // Weighted composite sum
    const rawCompositeScore = Math.round(
      climateSignalScore * customWeights.climateSignal +
      weatherScore * customWeights.weatherConditions +
      envScore * customWeights.environmentalConditions +
      historicalScore * customWeights.historicalRisk +
      exposureScore * customWeights.exposure +
      vulnScore * customWeights.vulnerability
    );

    const overallRiskScore = Math.max(12, Math.min(95, rawCompositeScore));
    const overallRiskLevel = this.categorizeRiskLevel(overallRiskScore);

    // Individual Hazard Scores
    const floodScore = Math.min(96, Math.max(15, Math.round(
      (peakRec.rainfall1d / 80) * 40 +
      (peakRec.rainfall7d / 250) * 35 +
      (peakRec.soilMoisture > 0.4 ? 25 : 10) +
      (floodCount > 0 ? 15 : 0)
    )));

    const droughtScore = Math.min(92, Math.max(10, Math.round(
      (droughtCount > 0 ? 60 : 0) +
      (peakRec.rainfall30d < 120 ? 30 : 5) +
      (peakRec.soilMoisture < 0.3 ? 20 : 5)
    )));

    const heatScore = Math.min(94, Math.max(10, Math.round(
      Math.max(0, (peakRec.temperatureMax - 30) / 8) * 70 +
      (heatCount > 0 ? 30 : 0)
    )));

    const factors = [
      `Climate Signal: Niño 3.4 SST anomaly at +${peakRec.nino34.toFixed(2)}°C`,
      `Antecedent Rainfall: 7-day accumulation at ${peakRec.rainfall7d.toFixed(1)} mm`,
      `Soil Pore Saturation: ${(peakRec.soilMoisture * 100).toFixed(1)}% volumetric moisture`,
      `Historical Dataset Frequency: ${floodCount} flood / ${droughtCount} drought days recorded`,
    ];

    const riskData: RiskApiResponse = {
      location: meta.name,
      overallRiskScore,
      overallRiskLevel,
      risks: {
        flood: {
          score: floodScore,
          probability: Number((floodScore / 100).toFixed(2)),
          confidence: floodScore > 75 ? 'High' : 'Medium',
        },
        drought: {
          score: droughtScore,
          probability: Number((droughtScore / 100).toFixed(2)),
          confidence: droughtScore > 70 ? 'High' : droughtScore > 40 ? 'Medium' : 'Low',
        },
        heatwave: {
          score: heatScore,
          probability: Number((heatScore / 100).toFixed(2)),
          confidence: heatScore > 65 ? 'High' : 'Medium',
        },
      },
      forecastWindow: '24–48 hours',
      dataMode: meta.isDatasetSource ? 'live' : 'demo',
      factors,
    };

    const result: ApiResponse<RiskApiResponse> = {
      success: true,
      data: riskData,
      dataMode: meta.isDatasetSource ? 'live' : 'demo',
      timestamp: new Date().toISOString(),
    };

    apiCache.set(cacheKey, result, 120);
    return result;
  }
}
