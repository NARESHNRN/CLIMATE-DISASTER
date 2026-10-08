from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

# 1. Weather Schemas
class WeatherCurrent(BaseModel):
    temperature: float
    humidity: int
    rainfall: float
    windSpeed: float
    pressure: float
    apparentTemperature: Optional[float] = None
    weatherCode: int = 0
    conditionText: str = "Partly Cloudy"

class WeatherForecastDay(BaseModel):
    time: str
    temperature: float
    rainfall: float
    tempMin: float
    tempMax: float

class WeatherResponse(BaseModel):
    location: str
    country: str = "India"
    latitude: float
    longitude: float
    dataMode: Literal["live", "demo"] = "live"
    lastUpdated: str
    current: WeatherCurrent
    forecast: List[WeatherForecastDay]
    source: str = "Open-Meteo Live API"

# 2. Prediction Schemas
class HazardFactor(BaseModel):
    factor: str
    weight: float
    observation: str

class HazardPrediction(BaseModel):
    hazardType: Literal["flood", "drought", "heatwave"]
    riskScore: float
    riskLevel: Literal["Very Low", "Low", "Moderate", "High", "Critical"]
    probabilityPercent: int
    confidencePercent: int
    primaryDrivers: List[HazardFactor]

class PredictionsResponse(BaseModel):
    location: str
    hazards: List[HazardPrediction]
    compositeRiskScore: float
    compositeRiskLevel: str
    forecastWindow: str
    dataMode: Literal["live", "demo"] = "demo"
    generatedAt: str

# 3. Risk Engine Schemas
class RiskHazardItem(BaseModel):
    score: float
    probability: float
    confidence: str

class RiskApiResponse(BaseModel):
    location: str
    overallRiskScore: float
    overallRiskLevel: Literal["Very Low", "Low", "Moderate", "High", "Very High"]
    risks: Dict[str, RiskHazardItem]
    forecastWindow: str
    dataMode: Literal["live", "demo"] = "demo"
    factors: List[str]

# 4. Alerts Schemas
class AlertApiResponse(BaseModel):
    id: str
    location: str
    hazard: Literal["Flood", "Drought", "Heatwave", "Compound"]
    status: Literal["Normal", "Watch", "Advisory", "Warning", "Critical"]
    probability: float
    message: str
    timestamp: str
    sourceType: Literal["AI Prediction", "Official Warning"]
    dataMode: Literal["live", "demo"] = "demo"
    officialNoticeDisclaimer: Optional[str] = None

# 5. Recommendations Schemas
class RoleRecommendationResponse(BaseModel):
    location: str
    role: Literal["resident", "farmer", "authority", "hospital"]
    riskLevel: str
    hazard: str
    recommendations: List[str]
    typeLabel: str = "Decision-support recommendations"
    dataMode: Literal["demo"] = "demo"

# 6. What-If Simulation Schemas
class WhatIfRequest(BaseModel):
    location: str
    rainfallChangePercent: float = 0.0
    temperatureChangeCelsius: float = 0.0
    riverLevelChangePercent: float = 0.0

class WhatIfHazards(BaseModel):
    flood: float
    heat: float
    drought: float

class WhatIfResponse(BaseModel):
    simulation: bool = True
    location: str
    baselineRisk: float
    simulatedRisk: float
    riskChange: float
    affectedZones: int
    infrastructureImpact: Literal["Low", "Moderate", "High", "Severe"]
    message: str
    disclaimer: str = "SIMULATION — NOT AN OFFICIAL FORECAST"
    simulatedHazards: WhatIfHazards

# 7. Model Comparison Schemas
class ModelMetric(BaseModel):
    name: str
    accuracy: float
    precision: float
    recall: float
    f1: float
    inferenceLatencyMs: float
    architecture: str

class ModelComparisonResponse(BaseModel):
    models: List[ModelMetric]
    dataMode: Literal["demo"] = "demo"
    disclaimer: str = "DEMO METRICS: Model benchmark scores are simulated validation estimates based on 70/30 time-split evaluation."

# 8. ENSO Schemas
class EnsoRecord(BaseModel):
    year: int
    month: int
    nino12: float
    nino12Anom: float
    nino3: float
    nino3Anom: float
    nino4: float
    nino4Anom: float
    nino34: float
    nino34Anom: float
    provenance: str = "Uploaded Dataset"

class OniRecord(BaseModel):
    season: str
    year: int
    total: float
    anom: float
    phase: Literal["El Niño", "La Niña", "Neutral"]
    provenance: str = "Uploaded Dataset"

class EnsoApiResponseData(BaseModel):
    currentOni: float
    currentNino34: float
    currentPhase: str
    historicalEnso: List[EnsoRecord]
    seasonalOni: List[OniRecord]
    teleconnectionEffect: str
    sourceDataset: str

# 9. Hazard Detail & Geospatial Schemas
class DrivingFactorItem(BaseModel):
    factor: str
    value: str
    contributionPercent: float
    datasetField: str
    provenance: str = "Uploaded Dataset"

class HazardDetail(BaseModel):
    id: str
    type: Literal["Flood", "Drought", "Heatwave", "Compound"]
    locationId: str
    date: str
    status: Literal["Active", "Warning", "Watch", "Nominal"]
    severityLevel: Literal["Low", "Moderate", "High", "Severe"]
    probability: float
    drivingFactors: List[DrivingFactorItem]
    affectedPopulationEstimate: str
    impactMetrics: Dict[str, str]
    provenance: str = "Uploaded Dataset"

class LocationGeoSummary(BaseModel):
    id: str
    name: str
    state: str
    latitude: float
    longitude: float
    elevationM: int
    dominantRiskLevel: Literal["Low", "Moderate", "High", "Severe", "Critical"]
    compositeRiskScore: float
    activeHazards: List[str]
    rainfall7dMm: float
    soilMoisturePercent: float
    stationType: str
    provenance: str = "Uploaded Dataset"

class DailyClimateRecord(BaseModel):
    locationId: str
    date: str
    latitude: float
    longitude: float
    temperatureMean: float
    temperatureMax: float
    temperatureMin: Optional[float] = None
    rainfall1d: float
    rainfall3d: float
    rainfall7d: float
    rainfall30d: float
    soilMoisture: float
    oni: float
    nino34: float
    ndvi: float
    floodLabel: int
    droughtLabel: int
    heatLabel: int
    riskScore: float
    riskLevel: Literal["Low", "Moderate", "High", "Severe", "Critical"]
    primaryHazard: Literal["None", "Flood", "Drought", "Heatwave", "Compound"]
    confidence: float
    provenance: str = "Uploaded Dataset"

class VulnerabilityProfile(BaseModel):
    locationId: str
    locationName: str
    physicalExposureScore: float
    drainageResilienceScore: float
    socialVulnerabilityScore: float
    adaptiveCapacityScore: float
    criticalAssetsAtRisk: List[str]
    provenance: str = "Demo / Simulated"

class DataSourceStatus(BaseModel):
    name: str
    type: str
    status: Literal["Connected", "Loaded", "Demo", "Degraded"]
    lastUpdated: str
    mode: Literal["Live", "Dataset", "Demo"]

# 10. LSTM Backend Schemas
class LstmStep(BaseModel):
    date: str
    value: float
    confidenceLower: float
    confidenceUpper: float

class LstmBackendResponse(BaseModel):
    location: str
    modelVersion: str = "Bi-LSTM-v2.4-Demo"
    forecastLeadDays: int = 7
    mae: float = 2.14
    rmse: float = 3.28
    historicalSequence: List[LstmStep]
    forecastSequence: List[LstmStep]
    importantVariables: List[Dict[str, Any]]
    disclaimer: str = "DEMO LSTM OUTPUT: Deterministic sequence extrapolation for prototype visualization. Not trained PyTorch model weights."
