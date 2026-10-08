import { DatasetAdapter } from './datasetAdapter';
import { PredictionItem, PredictionsResponse, ApiResponse } from '../data/types';
import { apiCache } from './cache';

export class PredictionService {
  /**
   * GET /api/predictions?location={location}
   * Generates structured predictions for Flood, Drought, Heatwave.
   * Grounded in uploaded dataset indicators with explicit "DEMO PREDICTION" architectural attribution.
   */
  public static async getPredictions(locationName?: string): Promise<ApiResponse<PredictionsResponse>> {
    const meta = DatasetAdapter.resolveLocation(locationName);
    const cacheKey = apiCache.buildKey('/api/predictions', meta.id);

    const cached = apiCache.get<ApiResponse<PredictionsResponse>>(cacheKey);
    if (cached) return { ...cached, cached: true };

    const records = DatasetAdapter.getLocationRecords(meta.id);
    const peakRec = records.reduce((prev, curr) => (curr.rainfall1d > prev.rainfall1d ? curr : prev), records[0]);

    // Flood Prediction
    const floodProb = Math.min(0.96, Math.max(0.18, Number(((peakRec.rainfall7d / 280) * 0.5 + (peakRec.soilMoisture > 0.4 ? 0.35 : 0.1)).toFixed(2))));
    const floodScore = Math.round(floodProb * 100);

    // Drought Prediction
    const hasDroughtInDataset = records.some((r) => r.droughtLabel === 1);
    const droughtProb = hasDroughtInDataset ? 0.88 : peakRec.rainfall30d < 100 ? 0.55 : 0.22;
    const droughtScore = Math.round(droughtProb * 100);

    // Heatwave Prediction
    const heatProb = peakRec.temperatureMax > 34 ? 0.78 : peakRec.temperatureMax > 32 ? 0.45 : 0.18;
    const heatScore = Math.round(heatProb * 100);

    const predictions: PredictionItem[] = [
      {
        hazard: 'Flood',
        riskScore: floodScore,
        probability: floodProb,
        confidence: floodScore > 70 ? 'High' : 'Medium',
        forecastWindow: '24–48 hours',
        trend: peakRec.rainfall1d > 25 ? 'Increasing' : 'Stable',
        model: 'Ensemble (Bi-LSTM + XGBoost Stacking)',
        modelVersion: 'demo-v1 (Un-trained Architectural Prototype)',
        majorFactors: [
          `Peak 24h precipitation: ${peakRec.rainfall1d.toFixed(1)} mm`,
          `Cumulative 7-day surge: ${peakRec.rainfall7d.toFixed(1)} mm`,
          `Volumetric soil saturation: ${(peakRec.soilMoisture * 100).toFixed(1)}%`,
          'Riparian drainage elevation gradient',
        ],
      },
      {
        hazard: 'Drought',
        riskScore: droughtScore,
        probability: droughtProb,
        confidence: droughtScore > 75 ? 'High' : droughtScore > 40 ? 'Medium' : 'Low',
        forecastWindow: '7–14 days',
        trend: hasDroughtInDataset ? 'Increasing' : 'Stable',
        model: 'Ensemble (Markov State + Random Forest)',
        modelVersion: 'demo-v1 (Un-trained Architectural Prototype)',
        majorFactors: [
          `30-day cumulative precipitation: ${peakRec.rainfall30d.toFixed(1)} mm`,
          `Normalized vegetation health index: ${peakRec.ndvi.toFixed(3)}`,
          `Sub-surface pore moisture deficit: ${(peakRec.soilMoisture * 100).toFixed(1)}%`,
          'El Niño Pacific warm phase suppression',
        ],
      },
      {
        hazard: 'Heatwave',
        riskScore: heatScore,
        probability: heatProb,
        confidence: heatScore > 65 ? 'High' : 'Medium',
        forecastWindow: '24–72 hours',
        trend: peakRec.temperatureMax > 33 ? 'Increasing' : 'Stable',
        model: 'Ensemble (Gradient Boosted Regressor)',
        modelVersion: 'demo-v1 (Un-trained Architectural Prototype)',
        majorFactors: [
          `Maximum daytime surface temperature: ${peakRec.temperatureMax.toFixed(1)} °C`,
          `Mean diurnal temperature: ${peakRec.temperatureMean.toFixed(1)} °C`,
          'Urban concrete surface heat retention (UHI)',
          'High solar shortwave radiation flux',
        ],
      },
    ];

    const data: PredictionsResponse = {
      location: meta.name,
      forecastWindow: '24–48 hours',
      predictions,
      dataMode: 'demo',
      generatedAt: new Date().toISOString(),
    };

    const result: ApiResponse<PredictionsResponse> = {
      success: true,
      data,
      dataMode: 'demo',
      timestamp: new Date().toISOString(),
    };

    apiCache.set(cacheKey, result, 120);
    return result;
  }
}
