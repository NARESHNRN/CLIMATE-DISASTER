import { DatasetAdapter } from './datasetAdapter';
import { ModelComparisonResponse, LstmBackendResponse, ApiResponse } from '../data/types';
import { apiCache } from './cache';

export class ModelService {
  /**
   * GET /api/model-comparison
   * Returns benchmark evaluation metrics for candidate machine learning models.
   * Labeled strictly with "DEMO METRICS" per system instruction.
   */
  public static async getModelComparison(): Promise<ApiResponse<ModelComparisonResponse>> {
    const cacheKey = '/api/model-comparison';
    const cached = apiCache.get<ApiResponse<ModelComparisonResponse>>(cacheKey);
    if (cached) return { ...cached, cached: true };

    const data: ModelComparisonResponse = {
      models: [
        {
          name: 'Logistic Regression (Baseline)',
          accuracy: 0.812,
          precision: 0.785,
          recall: 0.760,
          f1: 0.772,
          inferenceLatencyMs: 0.8,
          architecture: 'L2-Penalized Linear Classifier',
        },
        {
          name: 'Random Forest Ensemble',
          accuracy: 0.884,
          precision: 0.876,
          recall: 0.849,
          f1: 0.862,
          inferenceLatencyMs: 4.8,
          architecture: 'Bagged Decision Trees (n=300)',
        },
        {
          name: 'XGBoost / Gradient Boosting',
          accuracy: 0.912,
          precision: 0.898,
          recall: 0.924,
          f1: 0.910,
          inferenceLatencyMs: 2.1,
          architecture: 'Gradient Boosted Decision Trees (depth=6)',
        },
        {
          name: 'Long Short-Term Memory (LSTM)',
          accuracy: 0.932,
          precision: 0.925,
          recall: 0.912,
          f1: 0.918,
          inferenceLatencyMs: 14.2,
          architecture: 'Bi-LSTM (2 layers, 128 hidden units)',
        },
        {
          name: 'Hybrid Stacking Ensemble',
          accuracy: 0.947,
          precision: 0.941,
          recall: 0.931,
          f1: 0.936,
          inferenceLatencyMs: 18.5,
          architecture: 'Stacking Meta-Learner (LSTM + XGBoost -> Meta Logistic)',
        },
      ],
      dataMode: 'demo',
      disclaimer: 'DEMO METRICS — Benchmarking estimates evaluated on simulated validation split. No live PyTorch/TensorFlow training claimed.',
    };

    const result: ApiResponse<ModelComparisonResponse> = {
      success: true,
      data,
      dataMode: 'demo',
      timestamp: new Date().toISOString(),
    };

    apiCache.set(cacheKey, result, 300);
    return result;
  }

  /**
   * GET /api/lstm/forecast?location={location}
   * Returns sequence structure ready for seamless replacement by future FastAPI / PyTorch endpoint.
   */
  public static async getLstmForecast(locationName?: string): Promise<ApiResponse<LstmBackendResponse>> {
    const meta = DatasetAdapter.resolveLocation(locationName);
    const cacheKey = apiCache.buildKey('/api/lstm/forecast', meta.id);

    const cached = apiCache.get<ApiResponse<LstmBackendResponse>>(cacheKey);
    if (cached) return { ...cached, cached: true };

    const records = DatasetAdapter.getLocationRecords(meta.id);
    const lookback = records.slice(17, 24); // 7-day historical sequence from dataset
    const future = records.slice(24, 31);   // 7-day horizon

    const historical = lookback.map((r) => ({
      date: r.date,
      rainfall: Number(r.rainfall1d.toFixed(1)),
      tempMax: Number(r.temperatureMax.toFixed(1)),
      soilMoisture: Number(r.soilMoisture.toFixed(3)),
    }));

    const forecast = future.map((r, i) => {
      const predRain = Math.max(0, Number((r.rainfall1d * 1.05 + (i % 2 === 0 ? 2 : -1.5)).toFixed(1)));
      return {
        step: i + 1,
        date: r.date,
        rainfallPred: predRain,
        tempMaxPred: Number((r.temperatureMax + (i % 2 === 0 ? 0.3 : -0.2)).toFixed(1)),
        confidenceLow: Math.max(0, Number((predRain * 0.8).toFixed(1))),
        confidenceHigh: Number((predRain * 1.25 + 4).toFixed(1)),
      };
    });

    const data: LstmBackendResponse = {
      location: meta.name,
      model: 'LSTM',
      dataMode: 'demo',
      forecastLeadTime: 'T+1 to T+7 Days (Multi-Step Horizon)',
      metrics: {
        mae: 4.82,
        rmse: 6.24,
      },
      importantVariables: [
        'rainfall_7d (Antecedent Moisture Pulse)',
        'soil_moisture (Volumetric Saturation)',
        'temperature_max (Vapor Pressure Deficit)',
        'oni / nino34 (Equatorial Pacific Teleconnection)',
        'ndvi (Biosphere Vegetative Buffer)',
      ],
      historical,
      forecast,
    };

    const result: ApiResponse<LstmBackendResponse> = {
      success: true,
      data,
      dataMode: 'demo',
      timestamp: new Date().toISOString(),
    };

    apiCache.set(cacheKey, result, 120);
    return result;
  }
}
