/**
 * Raw Weather Station Observations, ENSO Sea Surface Temperature Anomalies,
 * and Oceanic Niño Index (ONI) running mean datasets as uploaded by the user.
 */

export const RAW_WEATHER_STATION_SAMPLE_HEADER = `location_name,latitude,longitude,date,temperature_mean,temperature_max,temperature_min,rainfall_daily_mm,wind_speed_mean,surface_pressure_mean,soil_moisture_mean`;

export const RAW_ENSO_SST_HEADER = `YR,MON,NINO1+2,ANOM,NINO3,ANOM.1,NINO4,ANOM.2,NINO3.4,ANOM.3`;

export const RAW_ONI_HEADER = `SEAS,YR,TOTAL,ANOM`;

// Comprehensive location geo metadata from uploaded coordinates and requested monitoring hubs
export const LOCATIONS_METADATA = [
  { id: 'Chennai', name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707, elevationCategory: 'Coromandel Coastal (6m)', riverBasin: 'Cooum / Adyar / Kosasthalaiyar' },
  { id: 'Mumbai', name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777, elevationCategory: 'Konkan Coast (14m)', riverBasin: 'Mithi River / Arabian Sea' },
  { id: 'Delhi', name: 'Delhi NCR', state: 'National Capital Territory', lat: 28.6139, lon: 77.2090, elevationCategory: 'Indo-Gangetic Plain (216m)', riverBasin: 'Yamuna River Basin' },
  { id: 'Bengaluru', name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946, elevationCategory: 'Deccan Plateau (920m)', riverBasin: 'Arkavathi / Vrishabhavathi' },
  { id: 'Hyderabad', name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867, elevationCategory: 'Deccan Plateau (542m)', riverBasin: 'Musi River Basin' },
  { id: 'Coimbatore', name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lon: 76.9558, elevationCategory: 'Kongu Plateau (411m)', riverBasin: 'Noyyal River Basin' },
  { id: 'Madurai', name: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lon: 78.1198, elevationCategory: 'Vaigai Basin (101m)', riverBasin: 'Vaigai River Catchment' },
  { id: 'Visakhapatnam', name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lon: 83.2185, elevationCategory: 'Eastern Ghats Coastal (45m)', riverBasin: 'Meghadrigedda / Bay of Bengal' },
  { id: 'Ahmedabad', name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714, elevationCategory: 'Lowland Plains (53m)', riverBasin: 'Sabarmati River Basin' },
  { id: 'Bhopal', name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126, elevationCategory: 'Malwa Plateau (527m)', riverBasin: 'Betwa / Upper Lake Catchment' },
  { id: 'Guwahati', name: 'Guwahati', state: 'Assam', lat: 26.1445, lon: 91.7362, elevationCategory: 'Brahmaputra Valley (55m)', riverBasin: 'Brahmaputra River Basin' },
  { id: 'Kolkata', name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639, elevationCategory: 'Lower Gangetic Delta (9m)', riverBasin: 'Hooghly / Ganga Delta' },
  { id: 'Patna', name: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376, elevationCategory: 'Mid-Gangetic Plain (53m)', riverBasin: 'Ganges / Son / Gandak Confluence' },
];
