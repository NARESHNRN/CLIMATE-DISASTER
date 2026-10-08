import { WeatherService } from './weatherService';
import { RiskService, RiskEngineWeights } from './riskService';
import { PredictionService } from './predictionService';
import { AlertService } from './alertService';
import { RecommendationService } from './recommendationService';
import { SimulationService } from './simulationService';
import { ModelService } from './modelService';
import { ClimateService, EnsoApiResponseData } from './climateService';
import { DataSourcesService } from './dataSourcesService';
import { ClimateRiskService } from './climateRiskService';
import { DatasetAdapter } from './datasetAdapter';
import {
  ApiResponse,
  WeatherResponse,
  PredictionsResponse,
  RiskApiResponse,
  AlertApiResponse,
  RoleRecommendationResponse,
  RoleType,
  WhatIfRequest,
  WhatIfResponse,
  ModelComparisonResponse,
  DataSourceStatus,
  LstmBackendResponse,
  HazardDetail,
  LocationGeoSummary,
  DailyClimateRecord,
  VulnerabilityProfile,
} from '../data/types';

/**
 * Global API Runtime Configuration
 * - 'demo': Uses local dataset & simulation service layer
 * - 'fastapi': Queries external FastAPI backend (defaults to http://localhost:8000) with automatic local fallback
 * - 'live': Queries live external APIs (e.g. Open-Meteo) with dataset fallback
 */
export type GlobalApiMode = 'demo' | 'fastapi' | 'live';

// Retrieve persisted mode or default to 'demo' (fully self-contained, no keys required)
const getInitialApiMode = (): GlobalApiMode => {
  try {
    const saved = localStorage.getItem('CLIMARISK_API_MODE');
    if (saved === 'demo' || saved === 'fastapi' || saved === 'live') return saved;
  } catch {
    // Ignore localStorage access issues
  }
  return (import.meta.env?.VITE_API_MODE as GlobalApiMode) || 'demo';
};

const getInitialBaseUrl = (): string => {
  try {
    const saved = localStorage.getItem('CLIMARISK_API_BASE_URL');
    if (saved && saved.trim()) return saved.trim();
  } catch {
    // Ignore localStorage access issues
  }
  return (import.meta.env?.VITE_API_BASE_URL as string) || 'http://localhost:8000';
};

let currentApiMode: GlobalApiMode = getInitialApiMode();
let currentBaseUrl: string = getInitialBaseUrl();

/**
 * Realistic async delay simulator to exercise frontend loading spinners and state transitions.
 */
const simulateNetworkDelay = async (minMs = 280, maxMs = 520): Promise<void> => {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

/**
 * Helper to query FastAPI endpoints when in 'fastapi' mode.
 * Returns null if the FastAPI server is offline/unreachable so caller falls back gracefully.
 */
async function tryFetchFastApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T> | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const normalizedBase = currentBaseUrl.replace(/\/+$/, '');
    const res = await fetch(`${normalizedBase}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
    clearTimeout(timer);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    return {
      success: true,
      data,
      dataMode: 'live',
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    console.info(`[FastAPI Mode] Endpoint ${endpoint} unreachable on ${currentBaseUrl} (${err.message}). Using local service fallback.`);
    return null;
  }
}

/**
 * Central API Client / Backend Simulation Facade
 * The frontend communicates EXCLUSIVELY with this object.
 * All functions are strictly asynchronous and return uniform ApiResponse<T> envelopes.
 */
export class Api {
  /**
   * Configure global API Mode ('demo' | 'fastapi' | 'live').
   * Persists choice in localStorage.
   */
  public static setApiMode(mode: GlobalApiMode): void {
    currentApiMode = mode;
    try {
      localStorage.setItem('CLIMARISK_API_MODE', mode);
    } catch {
      // Ignore
    }
  }

  public static getApiMode(): GlobalApiMode {
    return currentApiMode;
  }

  /**
   * Configure target FastAPI Base URL (e.g. http://localhost:8000).
   * Persists in localStorage.
   */
  public static setBaseUrl(url: string): void {
    if (url && url.trim()) {
      currentBaseUrl = url.trim();
      try {
        localStorage.setItem('CLIMARISK_API_BASE_URL', currentBaseUrl);
      } catch {
        // Ignore
      }
    }
  }

  public static getBaseUrl(): string {
    return currentBaseUrl;
  }

  /**
   * 1. GET /api/weather?location={location}
   * Fetches real-time weather from Open-Meteo or FastAPI, with dataset fallback.
   */
  public static async getWeather(location?: string): Promise<ApiResponse<WeatherResponse>> {
    if (currentApiMode === 'fastapi') {
      const fastApiRes = await tryFetchFastApi<WeatherResponse>(`/api/weather?location=${encodeURIComponent(location || '')}`);
      if (fastApiRes) return fastApiRes;
    }

    await simulateNetworkDelay(300, 600);

    if (currentApiMode === 'demo') {
      const fallback = DatasetAdapter.toWeatherResponse(location);
      return {
        success: true,
        data: fallback,
        dataMode: 'demo',
        timestamp: new Date().toISOString(),
        fallbackReason: 'API_MODE set to demo; using local dataset records',
      };
    }

    return WeatherService.getWeather(location);
  }

  /**
   * 2. GET /api/predictions?location={location}
   * Generates Flood, Drought, Heatwave predictions with major risk factors.
   */
  public static async getPredictions(location?: string): Promise<ApiResponse<PredictionsResponse>> {
    if (currentApiMode === 'fastapi') {
      const fastApiRes = await tryFetchFastApi<PredictionsResponse>(`/api/predictions?location=${encodeURIComponent(location || '')}`);
      if (fastApiRes) return fastApiRes;
    }
    await simulateNetworkDelay(250, 500);
    return PredictionService.getPredictions(location);
  }

  /**
   * 3. GET /api/risk?location={location}
   * Multi-hazard risk engine computing composite score (0–100) and hazard components.
   */
  public static async getRisk(
    location?: string,
    customWeights?: RiskEngineWeights
  ): Promise<ApiResponse<RiskApiResponse>> {
    if (currentApiMode === 'fastapi') {
      const fastApiRes = await tryFetchFastApi<RiskApiResponse>(`/api/risk?location=${encodeURIComponent(location || '')}`);
      if (fastApiRes) return fastApiRes;
    }
    await simulateNetworkDelay(300, 550);
    return RiskService.getRisk(location, customWeights);
  }

  /**
   * 4. GET /api/alerts?location={location}
   * Active disaster warnings (Normal, Watch, Advisory, Warning, Critical).
   */
  public static async getAlerts(location?: string): Promise<ApiResponse<AlertApiResponse[]>> {
    if (currentApiMode === 'fastapi') {
      const fastApiRes = await tryFetchFastApi<AlertApiResponse[]>(`/api/alerts?location=${encodeURIComponent(location || '')}`);
      if (fastApiRes) return fastApiRes;
    }
    await simulateNetworkDelay(200, 450);
    return AlertService.getAlerts(location);
  }

  /**
   * 5. POST /api/alerts
   * Registers a newly issued warning or scenario alert into the simulation store.
   */
  public static async createAlert(newAlert: Partial<AlertApiResponse>): Promise<ApiResponse<AlertApiResponse>> {
    if (currentApiMode === 'fastapi') {
      const fastApiRes = await tryFetchFastApi<AlertApiResponse>('/api/alerts', {
        method: 'POST',
        body: JSON.stringify(newAlert),
      });
      if (fastApiRes) return fastApiRes;
    }
    await simulateNetworkDelay(250, 450);
    return AlertService.createAlert(newAlert);
  }

  /**
   * 6. GET /api/recommendations?location={location}&role={role}
   * Tailored public safety directives for resident, farmer, authority, hospital.
   */
  public static async getRecommendations(
    location?: string,
    role: RoleType = 'resident'
  ): Promise<ApiResponse<RoleRecommendationResponse>> {
    if (currentApiMode === 'fastapi') {
      const fastApiRes = await tryFetchFastApi<RoleRecommendationResponse>(
        `/api/recommendations?location=${encodeURIComponent(location || '')}&role=${encodeURIComponent(role)}`
      );
      if (fastApiRes) return fastApiRes;
    }
    await simulateNetworkDelay(250, 480);
    return RecommendationService.getRecommendations(location, role);
  }

  /**
   * 7. POST /api/what-if
   * Counterfactual scenario test testing precipitation, temperature, and river crest shifts.
   */
  public static async runWhatIfSimulation(
    location: string,
    parameters: {
      rainfallChangePercent: number;
      temperatureChangeCelsius: number;
      riverLevelChangePercent: number;
    }
  ): Promise<ApiResponse<WhatIfResponse>> {
    const req: WhatIfRequest = {
      location,
      rainfallChangePercent: parameters.rainfallChangePercent,
      temperatureChangeCelsius: parameters.temperatureChangeCelsius,
      riverLevelChangePercent: parameters.riverLevelChangePercent,
    };

    if (currentApiMode === 'fastapi') {
      const fastApiRes = await tryFetchFastApi<WhatIfResponse>('/api/what-if', {
        method: 'POST',
        body: JSON.stringify(req),
      });
      if (fastApiRes) return fastApiRes;
    }

    await simulateNetworkDelay(400, 750);
    return SimulationService.runWhatIf(req);
  }

  /** Alias for runWhatIfSimulation */
  public static runWhatIf = Api.runWhatIfSimulation;

  /**
   * 8. GET /api/model-comparison
   * Benchmark comparison metrics for candidate ML architectures (DEMO METRICS).
   */
  public static async getModelComparison(): Promise<ApiResponse<ModelComparisonResponse>> {
    if (currentApiMode === 'fastapi') {
      const fastApiRes = await tryFetchFastApi<ModelComparisonResponse>('/api/model-comparison');
      if (fastApiRes) return fastApiRes;
    }
    await simulateNetworkDelay(300, 600);
    return ModelService.getModelComparison();
  }

  /**
   * 9. GET /api/forecast/enso
   * Historical & projected Equatorial Pacific Niño 3.4 SST anomalies and ONI index.
   */
  public static async getEnsoForecast(): Promise<ApiResponse<EnsoApiResponseData>> {
    if (currentApiMode === 'fastapi') {
      const fastApiRes = await tryFetchFastApi<EnsoApiResponseData>('/api/forecast/enso');
      if (fastApiRes) return fastApiRes;
    }
    await simulateNetworkDelay(250, 500);
    return ClimateService.getEnsoForecast();
  }

  /**
   * 10. GET /api/hazards/{location}
   * Granular breakdown of individual hazard events and contribution metrics.
   */
  public static async getHazards(location?: string): Promise<ApiResponse<HazardDetail[]>> {
    if (currentApiMode === 'fastapi') {
      const loc = location ? encodeURIComponent(location) : 'chennai';
      const fastApiRes = await tryFetchFastApi<HazardDetail[]>(`/api/hazards/${loc}`);
      if (fastApiRes) return fastApiRes;
    }
    await simulateNetworkDelay(250, 450);
    const hazards = ClimateRiskService.getHazards(location);
    return {
      success: true,
      data: hazards,
      dataMode: 'dataset',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 11. GET /api/map/risk
   * Multi-station geospatial summaries with verified latitude/longitude coordinates.
   */
  public static async getRiskMap(location?: string): Promise<ApiResponse<{ locations: LocationGeoSummary[]; activeLocation?: LocationGeoSummary }>> {
    if (currentApiMode === 'fastapi') {
      const fastApiRes = await tryFetchFastApi<{ locations: LocationGeoSummary[]; activeLocation?: LocationGeoSummary }>('/api/map/risk');
      if (fastApiRes) return fastApiRes;
    }
    await simulateNetworkDelay(300, 600);
    const mapData = ClimateRiskService.getRiskMap(location);
    return {
      success: true,
      data: {
        locations: mapData.locations,
        activeLocation: mapData.activeLocation,
      },
      dataMode: 'dataset',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 12. GET /api/timeline/{location}
   * Daily 31-day observation time series trajectory across all station parameters.
   */
  public static async getForecastTimeline(location?: string): Promise<ApiResponse<{ locationId: string; timeline: DailyClimateRecord[] }>> {
    if (currentApiMode === 'fastapi') {
      const loc = location ? encodeURIComponent(location) : 'chennai';
      const fastApiRes = await tryFetchFastApi<{ locationId: string; timeline: DailyClimateRecord[] }>(`/api/timeline/${loc}`);
      if (fastApiRes) return fastApiRes;
    }
    await simulateNetworkDelay(300, 550);
    const timeline = ClimateRiskService.getForecastTimeline(location);
    return {
      success: true,
      data: {
        locationId: timeline.locationId,
        timeline: timeline.timeline,
      },
      dataMode: 'dataset',
      timestamp: new Date().toISOString(),
    };
  }

  /** Alias for getForecastTimeline */
  public static getTimeline = Api.getForecastTimeline;

  /**
   * 13. GET /api/vulnerability/{location}
   * Physical exposure and drainage resilience profiling.
   */
  public static async getVulnerability(location?: string): Promise<ApiResponse<VulnerabilityProfile>> {
    if (currentApiMode === 'fastapi') {
      const loc = location ? encodeURIComponent(location) : 'chennai';
      const fastApiRes = await tryFetchFastApi<VulnerabilityProfile>(`/api/vulnerability/${loc}`);
      if (fastApiRes) return fastApiRes;
    }
    await simulateNetworkDelay(250, 450);
    const vuln = ClimateRiskService.getVulnerability(location);
    return {
      success: true,
      data: vuln,
      dataMode: 'demo',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 14. GET /api/data-sources
   * Connection statuses across Open-Meteo, Uploaded Dataset, NOAA, WMO, and IRI.
   */
  public static async getDataSources(): Promise<ApiResponse<DataSourceStatus[]>> {
    if (currentApiMode === 'fastapi') {
      const fastApiRes = await tryFetchFastApi<DataSourceStatus[]>('/api/data-sources');
      if (fastApiRes) return fastApiRes;
    }
    await simulateNetworkDelay(200, 400);
    return DataSourcesService.getDataSources();
  }

  /**
   * 15. GET /api/lstm/forecast?location={location}
   * Sequence-to-sequence structure ready for future FastAPI / PyTorch backend integration.
   */
  public static async getLstmForecast(location?: string): Promise<ApiResponse<LstmBackendResponse>> {
    if (currentApiMode === 'fastapi') {
      const fastApiRes = await tryFetchFastApi<LstmBackendResponse>(`/api/lstm/forecast?location=${encodeURIComponent(location || '')}`);
      if (fastApiRes) return fastApiRes;
    }
    await simulateNetworkDelay(350, 650);
    return ModelService.getLstmForecast(location);
  }

  /**
   * 16. GET /api/pipeline/status
   * Reports telemetry and health across the 10-stage simulated backend data pipeline.
   */
  public static async getPipelineStatus(location?: string) {
    await simulateNetworkDelay(200, 350);
    return DatasetAdapter.simulateDataPipeline(location);
  }
}

// Default export as well for flexibility
export default Api;
