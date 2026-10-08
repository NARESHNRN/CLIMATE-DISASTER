import React, { useState, useEffect } from 'react';
import { Api } from '../services/api';
import { ClimateRiskService } from '../services/climateRiskService';
import { EnsoApiResponseData } from '../services/climateService';
import { EnsoRecord, OniRecord } from '../data/types';
import { ProvenanceBadge } from './ProvenanceBadge';
import {
  Layers,
  TrendingUp,
  Globe,
  Thermometer,
  ShieldAlert,
  ArrowUpRight,
  Info,
  RefreshCw,
} from 'lucide-react';

interface EnsoClimateViewProps {
  auditProvenance: boolean;
}

export const EnsoClimateView: React.FC<EnsoClimateViewProps> = ({ auditProvenance }) => {
  const [ensoData, setEnsoData] = useState<EnsoApiResponseData>(() => ClimateRiskService.getEnsoForecast());
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<'recent' | 'all'>('recent');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Api.getEnsoForecast().then((res) => {
      if (isMounted) {
        setEnsoData(res.data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered slice of ENSO records
  const displayRecords =
    timeRange === 'recent'
      ? ensoData.historicalEnso.filter((r: EnsoRecord) => r.year >= 2020)
      : ensoData.historicalEnso;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                ENSO Telemetry: Equatorial Pacific Sea Surface Temperature
              </h2>
              <ProvenanceBadge source="Uploaded Dataset" field="enso_sst_dataset.csv & oni_dataset.csv" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Multi-decadal ENSO time series (1982-2026) and NOAA Oceanic Niño Index (1950-2026) from uploaded dataset.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {loading && (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
            )}
            <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
              Current Phase: {ensoData.currentPhase}
            </span>
          </div>
        </div>

        {/* Current State Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 block mb-1">Niño 3.4 SST Anomaly</span>
            <div className="text-2xl font-bold font-mono text-orange-600 dark:text-orange-400">
              +{ensoData.currentNino34.toFixed(2)} °C
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-1">col: nino34 / ANOM.3</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 block mb-1">Oceanic Niño Index (ONI)</span>
            <div className="text-2xl font-bold font-mono text-orange-600 dark:text-orange-400">
              +{ensoData.currentOni.toFixed(1)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-1">col: oni / ANOM</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 block mb-1">Monsoon Teleconnection Mechanism</span>
            <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Walker circulation shift modifying monsoon troughs &amp; cloudburst frequency
            </div>
          </div>
        </div>

        {/* Pacific SST Anomaly Timeline (1982-2026) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900 dark:text-white">
              Niño 3.4 SST Anomalies Trajectory (°C)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTimeRange('recent')}
                className={`px-2 py-1 rounded text-xs font-medium ${
                  timeRange === 'recent'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                2020-2026 Focus
              </button>
              <button
                onClick={() => setTimeRange('all')}
                className={`px-2 py-1 rounded text-xs font-medium ${
                  timeRange === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Full Multi-Decadal (1982-2026)
              </button>
            </div>
          </div>

          {/* Bar Chart of Anomalies */}
          <div className="h-44 w-full flex items-center gap-1.5 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
            {displayRecords.map((r: EnsoRecord, i: number) => {
              const isPositive = r.nino34Anom >= 0;
              const barHeight = Math.min(60, Math.abs(r.nino34Anom) * 22);

              return (
                <div
                  key={`${r.year}-${r.month}-${i}`}
                  className="flex-1 min-w-[28px] h-full flex flex-col justify-center items-center group relative cursor-pointer"
                  title={`${r.year}-${r.month.toString().padStart(2, '0')}: Niño 3.4 ${r.nino34}°C (Anomaly: ${r.nino34Anom >= 0 ? '+' : ''}${r.nino34Anom}°C)`}
                >
                  {/* Top space for positive bars */}
                  <div className="h-[65px] flex items-end">
                    {isPositive && (
                      <div
                        className="w-4 bg-orange-500 rounded-t group-hover:bg-orange-400 transition-all"
                        style={{ height: `${barHeight}px` }}
                      />
                    )}
                  </div>

                  {/* Zero axis */}
                  <div className="w-full h-[1px] bg-slate-300 dark:bg-slate-700" />

                  {/* Bottom space for negative bars */}
                  <div className="h-[65px] flex items-start">
                    {!isPositive && (
                      <div
                        className="w-4 bg-blue-500 rounded-b group-hover:bg-blue-400 transition-all"
                        style={{ height: `${barHeight}px` }}
                      />
                    )}
                  </div>

                  {/* Year label */}
                  <span className="text-[9px] font-mono text-slate-400 mt-1">
                    {r.year.toString().slice(-2)}/{r.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-orange-500" /> El Niño Warming (+0.5°C threshold)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-500" /> La Niña Cooling (-0.5°C threshold)
            </span>
          </div>
        </div>
      </div>

      {/* Seasonal ONI Running Mean Table */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Oceanic Niño Index (ONI) 3-Month Running Mean Sequence
            </h3>
            <p className="text-xs text-slate-500">
              Grounded in the uploaded `oni_dataset.csv` records (2023-2026 series)
            </p>
          </div>
          <ProvenanceBadge source="Uploaded Dataset" field="SEAS, YR, TOTAL, ANOM" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Season Window</th>
                <th className="py-2.5 px-3">Year</th>
                <th className="py-2.5 px-3">Absolute SST (°C)</th>
                <th className="py-2.5 px-3">Anomaly (°C)</th>
                <th className="py-2.5 px-3">ENSO Phase Classification</th>
                <th className="py-2.5 px-3">Dataset Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {ensoData.seasonalOni.map((item: OniRecord, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white font-mono">
                    {item.season}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-700 dark:text-slate-300">
                    {item.year}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-700 dark:text-slate-300">
                    {item.total.toFixed(2)}
                  </td>
                  <td className={`py-2 px-3 font-mono font-semibold ${
                    item.anom >= 0.5 ? 'text-orange-600' : item.anom <= -0.5 ? 'text-blue-600' : 'text-slate-600'
                  }`}>
                    {item.anom >= 0 ? '+' : ''}{item.anom.toFixed(2)}
                  </td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      item.phase === 'El Niño'
                        ? 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                        : item.phase === 'La Niña'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {item.phase}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <ProvenanceBadge source="Uploaded Dataset" field="oni_dataset.csv" showIcon={false} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
