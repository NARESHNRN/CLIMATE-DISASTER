import { CLIMATE_DATASET_RECORDS, DATASET_INSPECTION_REPORT } from '../data/dataset';
import { LOCATIONS_METADATA } from '../data/rawEnsoData';
import { DailyClimateRecord, WeatherResponse } from '../data/types';

/**
 * Geographic registry of supported locations.
 * Includes all uploaded dataset cities plus requested regional hubs (Coimbatore, Madurai, Visakhapatnam).
 * Default location: Chennai, Tamil Nadu, India.
 */
export interface SupportedLocationMeta {
  id: string;
  name: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  isDatasetSource: boolean;
}

export const SUPPORTED_LOCATIONS: Record<string, SupportedLocationMeta> = {
  chennai: { id: 'Chennai', name: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0827, longitude: 80.2707, isDatasetSource: true },
  mumbai: { id: 'Mumbai', name: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 19.0760, longitude: 72.8777, isDatasetSource: true },
  delhi: { id: 'Delhi', name: 'Delhi', state: 'Delhi NCR', country: 'India', latitude: 28.6139, longitude: 77.2090, isDatasetSource: true },
  bengaluru: { id: 'Bengaluru', name: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946, isDatasetSource: true },
  hyderabad: { id: 'Hyderabad', name: 'Hyderabad', state: 'Telangana', country: 'India', latitude: 17.3850, longitude: 78.4867, isDatasetSource: true },
  coimbatore: { id: 'Coimbatore', name: 'Coimbatore', state: 'Tamil Nadu', country: 'India', latitude: 11.0168, longitude: 76.9558, isDatasetSource: false },
  madurai: { id: 'Madurai', name: 'Madurai', state: 'Tamil Nadu', country: 'India', latitude: 9.9252, longitude: 78.1198, isDatasetSource: false },
  visakhapatnam: { id: 'Visakhapatnam', name: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India', latitude: 17.6868, longitude: 83.2185, isDatasetSource: false },
  ahmedabad: { id: 'Ahmedabad', name: 'Ahmedabad', state: 'Gujarat', country: 'India', latitude: 23.0225, longitude: 72.5714, isDatasetSource: true },
  bhopal: { id: 'Bhopal', name: 'Bhopal', state: 'Madhya Pradesh', country: 'India', latitude: 23.2599, longitude: 77.4126, isDatasetSource: true },
  guwahati: { id: 'Guwahati', name: 'Guwahati', state: 'Assam', country: 'India', latitude: 26.1445, longitude: 91.7362, isDatasetSource: true },
  kolkata: { id: 'Kolkata', name: 'Kolkata', state: 'West Bengal', country: 'India', latitude: 22.5726, longitude: 88.3639, isDatasetSource: true },
  patna: { id: 'Patna', name: 'Patna', state: 'Bihar', country: 'India', latitude: 25.5941, longitude: 85.1376, isDatasetSource: true },
};

export const DEFAULT_LOCATION_ID = 'Chennai';

export class DatasetAdapter {
  public static resolveLocation(locationName?: string): SupportedLocationMeta {
    if (!locationName) return SUPPORTED_LOCATIONS.chennai;
    const key = locationName.toLowerCase().trim();
    return SUPPORTED_LOCATIONS[key] || SUPPORTED_LOCATIONS.chennai;
  }

  public static getLocationRecords(locationName?: string): DailyClimateRecord[] {
    const meta = this.resolveLocation(locationName);
    const matches = CLIMATE_DATASET_RECORDS.filter(
      (r) => r.locationId.toLowerCase() === meta.id.toLowerCase()
    );

    // If the location is an external addition not in the July 2023 10-city dataset (e.g. Coimbatore),
    // map to the closest regional climatological proxy (Chennai) with simulated geographic adjustment.
    if (matches.length > 0) return matches;

    const proxy = CLIMATE_DATASET_RECORDS.filter(
      (r) => r.locationId.toLowerCase() === 'chennai'
    );
    return proxy.map((r) => ({
      ...r,
      locationId: meta.id,
      latitude: meta.latitude,
      longitude: meta.longitude,
      provenance: 'Demo / Simulated',
    }));
  }

  /**
   * Normalizes dataset observations into the standard WeatherResponse format.
   */
  public static toWeatherResponse(locationName?: string): WeatherResponse {
    const meta = this.resolveLocation(locationName);
    const records = this.getLocationRecords(meta.id);
    const latest = records[records.length - 1] || records[0];

    const forecast = records.slice(-7).map((r, i) => ({
      time: r.date,
      temperature: Number(r.temperatureMean.toFixed(1)),
      rainfall: Number(r.rainfall1d.toFixed(1)),
      tempMin: Number((r.temperatureMean - 3.5).toFixed(1)),
      tempMax: Number(r.temperatureMax.toFixed(1)),
    }));

    return {
      location: meta.name,
      country: meta.country,
      latitude: meta.latitude,
      longitude: meta.longitude,
      dataMode: 'demo',
      lastUpdated: new Date().toISOString(),
      current: {
        temperature: Number(latest.temperatureMean.toFixed(1)),
        humidity: Math.round(latest.soilMoisture * 100 + 20),
        rainfall: Number(latest.rainfall1d.toFixed(1)),
        windSpeed: 14.2,
        pressure: 1008.4,
        apparentTemperature: Number((latest.temperatureMax + 1.2).toFixed(1)),
        weatherCode: latest.rainfall1d > 20 ? 63 : latest.rainfall1d > 0 ? 51 : 1,
        conditionText: latest.rainfall1d > 20 ? 'Heavy Rainfall' : latest.rainfall1d > 0 ? 'Light Rain' : 'Partly Cloudy',
      },
      forecast,
      source: meta.isDatasetSource ? 'Uploaded Dataset (Normalized via Adapter)' : 'Climatological Regional Proxy',
    };
  }

  /**
   * Simulates the future 10-stage backend pipeline:
   * DATA COLLECTION -> VALIDATION -> CLEANING -> NORMALIZATION -> FEATURE ENGINEERING ->
   * LSTM PREDICTION -> BASELINE ML MODELS -> RISK CALCULATION -> EXPLANATION -> ALERT ENGINE
   */
  public static simulateDataPipeline(locationName?: string) {
    const meta = this.resolveLocation(locationName);
    const records = this.getLocationRecords(meta.id);

    return {
      stages: [
        { stage: '1. DATA COLLECTION', status: 'Completed', latencyMs: 42, details: `Acquired 31 daily vectors for ${meta.name}` },
        { stage: '2. VALIDATION', status: 'Completed', latencyMs: 8, details: 'Verified non-null floats for temperature, precipitation & moisture' },
        { stage: '3. CLEANING', status: 'Completed', latencyMs: 5, details: '0 outliers removed, 0 NaNs detected' },
        { stage: '4. NORMALIZATION', status: 'Completed', latencyMs: 12, details: 'StandardScaler applied to 14 multi-variate channels' },
        { stage: '5. FEATURE ENGINEERING', status: 'Completed', latencyMs: 18, details: 'Calculated 1d/3d/7d/30d accumulation pulses & pore saturation' },
        { stage: '6. LSTM PREDICTION', status: 'Completed', latencyMs: 64, details: 'Bidirectional LSTM sliding window inference (t+1 to t+7)' },
        { stage: '7. BASELINE ML MODELS', status: 'Completed', latencyMs: 25, details: 'XGBoost & Random Forest tabular voting ensemble' },
        { stage: '8. RISK CALCULATION', status: 'Completed', latencyMs: 10, details: 'Composite multi-hazard risk engine weighted score' },
        { stage: '9. EXPLANATION', status: 'Completed', latencyMs: 15, details: 'SHAP-style additive feature decomposition' },
        { stage: '10. ALERT ENGINE', status: 'Completed', latencyMs: 9, details: 'Evaluated advisory thresholds against ground truth' },
      ],
      totalLatencyMs: 208,
      pipelineMode: meta.isDatasetSource ? 'Uploaded Dataset Grounded' : 'Simulation Fallback',
    };
  }
}
