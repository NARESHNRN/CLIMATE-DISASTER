import { ClimateRiskService } from './climateRiskService';
import { ApiResponse, EnsoRecord, OniRecord } from '../data/types';
import { apiCache } from './cache';

export interface EnsoApiResponseData {
  currentOni: number;
  currentNino34: number;
  currentPhase: string;
  historicalEnso: EnsoRecord[];
  seasonalOni: OniRecord[];
  teleconnectionEffect: string;
  sourceDataset: string;
}

export class ClimateService {
  /**
   * GET /api/forecast/enso
   */
  public static async getEnsoForecast(): Promise<ApiResponse<EnsoApiResponseData>> {
    const cacheKey = '/api/forecast/enso';
    const cached = apiCache.get<ApiResponse<EnsoApiResponseData>>(cacheKey);
    if (cached) return { ...cached, cached: true };

    const raw = ClimateRiskService.getEnsoForecast();

    const data: EnsoApiResponseData = {
      currentOni: raw.currentOni,
      currentNino34: raw.currentNino34,
      currentPhase: raw.currentPhase,
      historicalEnso: raw.historicalEnso,
      seasonalOni: raw.seasonalOni,
      teleconnectionEffect: raw.teleconnectionEffect,
      sourceDataset: raw.sourceDataset,
    };

    const result: ApiResponse<EnsoApiResponseData> = {
      success: true,
      data,
      dataMode: 'dataset',
      timestamp: new Date().toISOString(),
    };

    apiCache.set(cacheKey, result, 300);
    return result;
  }
}
