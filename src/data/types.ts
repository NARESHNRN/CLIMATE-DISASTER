/**
 * Core types for ClimaRisk AI - Disaster Risk & Climate Resilience Platform
 * Grounded directly in the uploaded user datasets.
 */

export type DataSourceProvenance = 'Uploaded Dataset' | 'Demo / Simulated';

export interface DatasetInspectionReport {
  fileFormat: string;
  datasets: {
    name: string;
    description: string;
    recordsCount: number;
    columnsCount: number;
    columns: {
      name: string;
      type: string;
      description: string;
      sampleValue: string | number;
      missingCount: number;
      min?: number;
      max?: number;
    }[];
  }[];
  temporalCoverage: {
    dailyObservations: string;
    ensoSstTimeseries: string;
    oniSeasonalTimeseries: string;
  };
  geographicCoverage: {
    locationsCount: number;
    boundingBox: {
      minLat: number;
      maxLat: number;
      minLon: number;
      maxLon: number;
    };
    locations: {
      id: string;
      name: string;
      state: string;
      latitude: number;
      longitude: number;
      elevationCategory: string;
    }[];
  };
  missingValuesSummary: {
    totalMissing: number;
    notes: string;
  };
  hazardDistribution: {
    floodDays: number;
    droughtDays: number;
    heatDays: number;
    multiHazardDays: number;
  };
}

export interface DailyClimateRecord {
  // Primary Keys
  locationId: string;
  date: string; // YYYY-MM-DD
  latitude: number;
  longitude: number;

  // Temperature (Celsius)
  temperatureMean: number;
  temperatureMax: number;
  temperatureMin?: number;

  // Precipitation (mm)
  rainfall1d: number;
  rainfall3d: number;
  rainfall7d: number;
  rainfall30d: number;

  // Hydro-Atmospheric
  soilMoisture: number; // m³/m³ volumetric
  windSpeedMean?: number; // km/h
  surfacePressureMean?: number; // hPa

  // Large-scale Climate & Biosphere
  oni: number; // Oceanic Niño Index (1.0 in July 2023)
  nino34: number; // Nino 3.4 SST index (1.07 in July 2023)
  ndvi: number; // Normalized Difference Vegetation Index

  // Target Hazard Ground-Truth Labels (Uploaded Dataset)
  floodLabel: number; // 0 or 1
  droughtLabel: number; // 0 or 1
  heatLabel: number; // 0 or 1

  // Computed & Derived Indicators
  riskScore: number; // 0 - 100 composite risk score
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe' | 'Critical';
  primaryHazard: 'None' | 'Flood' | 'Drought' | 'Heatwave' | 'Compound';
  confidence: number; // 0 - 100% confidence based on indicator agreement
  provenance: DataSourceProvenance;
  fieldProvenanceMap: Record<string, DataSourceProvenance>;
}

export interface EnsoRecord {
  year: number;
  month: number;
  nino12: number;
  nino12Anom: number;
  nino3: number;
  nino3Anom: number;
  nino4: number;
  nino4Anom: number;
  nino34: number;
  nino34Anom: number;
  provenance: DataSourceProvenance;
}

export interface OniRecord {
  season: string; // DJF, JFM, etc.
  year: number;
  total: number;
  anom: number;
  phase: 'El Niño' | 'La Niña' | 'Neutral';
  provenance: DataSourceProvenance;
}

export interface HazardDetail {
  id: string;
  type: 'Flood' | 'Drought' | 'Heatwave' | 'Compound';
  locationId: string;
  date: string;
  status: 'Active' | 'Warning' | 'Watch' | 'Nominal';
  severityLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  probability: number; // 0 - 100%
  drivingFactors: {
    factor: string;
    value: string;
    contributionPercent: number;
    datasetField: string;
    provenance: DataSourceProvenance;
  }[];
  affectedPopulationEstimate: string;
  impactMetrics: {
    infrastructure: string;
    agriculture: string;
    waterSupply: string;
  };
  provenance: DataSourceProvenance;
}

export interface LocationGeoSummary {
  id: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  currentRiskScore: number;
  currentRiskLevel: 'Low' | 'Moderate' | 'High' | 'Severe' | 'Critical';
  activeHazards: string[];
  rainfall7d: number;
  temperatureMax: number;
  soilMoisture: number;
  ndvi: number;
  recordsCount: number;
  hasFloodEvent: boolean;
  hasDroughtEvent: boolean;
  hasHeatEvent: boolean;
  provenance: DataSourceProvenance;
}

export interface RecommendationItem {
  id: string;
  locationId: string;
  category: 'Civil Protection' | 'Drainage & Infrastructure' | 'Agriculture & Irrigation' | 'Public Health' | 'Emergency Services';
  priority: 'Immediate' | 'High' | 'Medium' | 'Routine';
  action: string;
  rationale: string;
  triggerThreshold: string;
  provenance: DataSourceProvenance;
}

export interface VulnerabilityProfile {
  locationId: string;
  locationName: string;
  physicalExposureScore: number; // 0 - 100
  socialVulnerabilityScore: number; // 0 - 100
  drainageResilienceScore: number; // 0 - 100
  adaptiveCapacityScore: number; // 0 - 100
  criticalAssetsAtRisk: string[];
  soilSaturationStatus: 'Low (<0.25)' | 'Optimal (0.25-0.40)' | 'Saturated (>0.40)';
  topRiskDriver: string;
  provenance: DataSourceProvenance;
}

export interface AlertNotification {
  id: string;
  locationId: string;
  locationName: string;
  date: string;
  severity: 'Critical' | 'Severe' | 'Warning' | 'Advisory';
  hazardType: 'Flood' | 'Drought' | 'Heatwave' | 'Compound';
  title: string;
  description: string;
  actionRequired: string;
  metricTrigger: string;
  timestamp: string;
  provenance: DataSourceProvenance;
}

export interface LstmForecastPoint {
  date: string;
  step: number; // Lookahead t+1 to t+7
  actualRainfall?: number;
  predictedRainfall: number;
  actualTempMax?: number;
  predictedTempMax: number;
  confidenceLower: number;
  confidenceUpper: number;
  floodProbability: number;
  provenance: DataSourceProvenance;
}

export interface LstmConceptualSequence {
  locationId: string;
  lookbackDays: number; // e.g. 7 days historical sliding window
  historicalSequence: {
    date: string;
    temperatureMean: number;
    temperatureMax: number;
    rainfall1d: number;
    soilMoisture: number;
    ndvi: number;
    oni: number;
  }[];
  forecastSequence: LstmForecastPoint[];
  featureAttributions: {
    feature: string;
    weight: number;
    importance: string;
  }[];
  architectureSummary: {
    modelType: string;
    inputDimensions: string;
    hiddenUnits: number;
    sequenceLength: string;
    disclaimer: string;
  };
  provenance: DataSourceProvenance;
}

export interface ModelComparisonMetric {
  modelName: string;
  architecture: string;
  accuracy: number;
  f1Score: number;
  precision: number;
  recall: number;
  aucRoc: number;
  inferenceLatencyMs: number;
  suitability: string;
  provenance: DataSourceProvenance;
}

export interface SimulationParameters {
  temperatureOffsetC: number; // e.g. -2 to +4 C
  rainfallMultiplier: number; // e.g. 0.5 to 2.5x
  soilMoistureSaturationOffset: number; // -0.1 to +0.2
  nino34AnomalyShift: number; // -1.5 to +2.5
}

export interface SimulationResult {
  parametersApplied: SimulationParameters;
  projectedFloodDays: number;
  projectedDroughtDays: number;
  projectedHeatDays: number;
  riskShiftPercent: number;
  impactSummary: string;
  affectedLocations: {
    locationId: string;
    originalRiskScore: number;
    simulatedRiskScore: number;
    hazardChange: string;
  }[];
  provenance: DataSourceProvenance;
}

// ==========================================
// Backend / API-Simulation Layer Contracts
// ==========================================

export type DataMode = 'live' | 'demo' | 'dataset';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  dataMode: DataMode;
  timestamp: string;
  fallbackReason?: string;
  cached?: boolean;
  error?: {
    code: string;
    message: string;
  };
}

export interface WeatherCurrent {
  temperature: number; // °C
  humidity: number; // %
  rainfall: number; // mm
  windSpeed: number; // km/h
  pressure: number; // hPa
  apparentTemperature?: number;
  weatherCode?: number;
  conditionText?: string;
}

export interface WeatherForecastPoint {
  time: string;
  temperature: number;
  rainfall: number;
  tempMin?: number;
  tempMax?: number;
}

export interface WeatherResponse {
  location: string;
  country: string;
  latitude: number;
  longitude: number;
  dataMode: 'live' | 'demo';
  lastUpdated: string;
  current: WeatherCurrent;
  forecast: WeatherForecastPoint[];
  source: string;
}

export interface PredictionItem {
  hazard: 'Flood' | 'Drought' | 'Heatwave';
  riskScore: number; // 0-100
  probability: number; // 0.0 - 1.0
  confidence: 'Low' | 'Medium' | 'High';
  forecastWindow: string; // e.g. "24–48 hours"
  trend: 'Increasing' | 'Stable' | 'Decreasing';
  model: string;
  modelVersion: string;
  majorFactors: string[];
}

export interface PredictionsResponse {
  location: string;
  forecastWindow: string;
  predictions: PredictionItem[];
  dataMode: 'live' | 'demo';
  generatedAt: string;
}

export interface RiskApiResponse {
  location: string;
  overallRiskScore: number;
  overallRiskLevel: 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High';
  risks: {
    flood: {
      score: number;
      probability: number;
      confidence: string;
    };
    drought: {
      score: number;
      probability: number;
      confidence: string;
    };
    heatwave: {
      score: number;
      probability: number;
      confidence: string;
    };
  };
  forecastWindow: string;
  dataMode: 'live' | 'demo';
  factors: string[];
}

export type AlertSeverity = 'Normal' | 'Watch' | 'Advisory' | 'Warning' | 'Critical';

export interface AlertApiResponse {
  id: string;
  location: string;
  hazard: 'Flood' | 'Drought' | 'Heatwave' | 'Compound';
  status: AlertSeverity;
  probability: number;
  message: string;
  timestamp: string;
  sourceType: 'AI Prediction' | 'Official Warning';
  dataMode: 'live' | 'demo';
  officialNoticeDisclaimer?: string;
}

export type RoleType = 'resident' | 'farmer' | 'authority' | 'hospital';

export interface RoleRecommendationResponse {
  location: string;
  role: RoleType;
  riskLevel: string;
  hazard: string;
  recommendations: string[];
  typeLabel: 'Decision-support recommendations';
  dataMode: 'demo';
}

export interface WhatIfRequest {
  location: string;
  rainfallChangePercent: number; // e.g. +20%
  temperatureChangeCelsius: number; // e.g. +1.5C
  riverLevelChangePercent: number; // e.g. +10%
}

export interface WhatIfResponse {
  simulation: true;
  location: string;
  baselineRisk: number;
  simulatedRisk: number;
  riskChange: number;
  affectedZones: number;
  infrastructureImpact: 'Low' | 'Moderate' | 'High' | 'Severe';
  message: string;
  disclaimer: 'SIMULATION — NOT AN OFFICIAL FORECAST';
  simulatedHazards: {
    flood: number;
    heat: number;
    drought: number;
  };
}

export interface ModelComparisonResponse {
  models: {
    name: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
    inferenceLatencyMs: number;
    architecture: string;
  }[];
  dataMode: 'demo';
  disclaimer: string;
}

export interface DataSourceStatus {
  name: string;
  type: string;
  status: 'Connected' | 'Loaded' | 'Demo' | 'Degraded';
  lastUpdated: string;
  mode: 'Live' | 'Dataset' | 'Demo';
  description: string;
}

export interface LstmBackendResponse {
  location: string;
  model: 'LSTM';
  dataMode: 'demo';
  forecastLeadTime: string;
  metrics: {
    mae: number;
    rmse: number;
  };
  importantVariables: string[];
  historical: {
    date: string;
    rainfall: number;
    tempMax: number;
    soilMoisture: number;
  }[];
  forecast: {
    step: number;
    date: string;
    rainfallPred: number;
    tempMaxPred: number;
    confidenceLow: number;
    confidenceHigh: number;
  }[];
}

