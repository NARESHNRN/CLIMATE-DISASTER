import { DatasetAdapter, SUPPORTED_LOCATIONS } from './datasetAdapter';
import { WeatherResponse, ApiResponse } from '../data/types';
import { apiCache } from './cache';

/**
 * Weather Service Adapter
 * Fetches real meteorological data from Open-Meteo (no secret key required in client)
 * with robust timeout, rate-limiting, and dataset/demo fallback handling.
 */
export class WeatherService {
  private static FETCH_TIMEOUT_MS = 6000;

  /**
   * Translates WMO weather codes to human-readable condition text.
   */
  private static decodeWmoCode(code?: number): string {
    if (code === undefined || code === null) return 'Partly Cloudy';
    if (code === 0) return 'Clear Sky';
    if (code === 1 || code === 2 || code === 3) return 'Partly Cloudy';
    if (code >= 45 && code <= 48) return 'Foggy / Low Visibility';
    if (code >= 51 && code <= 55) return 'Drizzle';
    if (code >= 61 && code <= 65) return 'Rain Showers';
    if (code >= 71 && code <= 77) return 'Snow / Hail';
    if (code >= 80 && code <= 82) return 'Heavy Convective Showers';
    if (code >= 95) return 'Severe Thunderstorm';
    return 'Scattered Clouds';
  }

  /**
   * GET /api/weather
   * Fetches live weather for requested location with graceful demo fallback.
   */
  public static async getWeather(locationName?: string): Promise<ApiResponse<WeatherResponse>> {
    const meta = DatasetAdapter.resolveLocation(locationName);
    const cacheKey = apiCache.buildKey('/api/weather', meta.id);

    // Check in-memory cache first (5-minute TTL for weather)
    const cached = apiCache.get<ApiResponse<WeatherResponse>>(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.FETCH_TIMEOUT_MS);

      // Open-Meteo Open API query with hourly & daily forecast
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${meta.latitude}&longitude=${meta.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,wind_speed_10m,surface_pressure,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Open-Meteo responded with status ${response.status}`);
      }

      const json = await response.json();

      const current = json.current;
      const daily = json.daily;

      const forecastPoints = (daily?.time || []).slice(0, 7).map((t: string, i: number) => ({
        time: t,
        temperature: Number(daily.temperature_2m_max?.[i] ?? 30),
        rainfall: Number(daily.precipitation_sum?.[i] ?? 0),
        tempMin: Number(daily.temperature_2m_min?.[i] ?? 24),
        tempMax: Number(daily.temperature_2m_max?.[i] ?? 32),
      }));

      const weatherData: WeatherResponse = {
        location: meta.name,
        country: meta.country,
        latitude: meta.latitude,
        longitude: meta.longitude,
        dataMode: 'live',
        lastUpdated: new Date().toISOString(),
        current: {
          temperature: Number(current?.temperature_2m?.toFixed(1) ?? 30.5),
          humidity: Math.round(current?.relative_humidity_2m ?? 75),
          rainfall: Number(current?.precipitation?.toFixed(1) ?? 0),
          windSpeed: Number(current?.wind_speed_10m?.toFixed(1) ?? 12.0),
          pressure: Number(current?.surface_pressure?.toFixed(1) ?? 1008.0),
          apparentTemperature: Number(current?.apparent_temperature?.toFixed(1) ?? 32.0),
          weatherCode: current?.weather_code ?? 0,
          conditionText: this.decodeWmoCode(current?.weather_code),
        },
        forecast: forecastPoints,
        source: 'Open-Meteo Live API',
      };

      const result: ApiResponse<WeatherResponse> = {
        success: true,
        data: weatherData,
        dataMode: 'live',
        timestamp: new Date().toISOString(),
      };

      apiCache.set(cacheKey, result, 300); // 5 min TTL
      return result;
    } catch (err: unknown) {
      // Graceful fallback to dataset / demo simulation
      const fallbackReason = err instanceof Error ? err.message : 'External meteorological service unavailable';
      const fallbackData = DatasetAdapter.toWeatherResponse(meta.id);

      const result: ApiResponse<WeatherResponse> = {
        success: true,
        data: fallbackData,
        dataMode: 'demo',
        timestamp: new Date().toISOString(),
        fallbackReason,
      };

      // Cache fallback briefly (60s) so UI doesn't spam failing network
      apiCache.set(cacheKey, result, 60);
      return result;
    }
  }
}
