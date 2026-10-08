import React, { useState, useEffect } from 'react';
import { Api } from '../services/api';
import { DailyClimateRecord } from '../data/types';
import { LOCATIONS_METADATA } from '../data/rawEnsoData';
import { ProvenanceBadge } from './ProvenanceBadge';
import {
  Calendar,
  CloudRain,
  Flame,
  Droplets,
  TrendingUp,
  AlertTriangle,
  Sliders,
  RefreshCw,
} from 'lucide-react';

interface ForecastTimelineViewProps {
  selectedLocationId: string;
  onSelectLocation: (locId: string) => void;
  auditProvenance: boolean;
}

export const ForecastTimelineView: React.FC<ForecastTimelineViewProps> = ({
  selectedLocationId,
  onSelectLocation,
  auditProvenance,
}) => {
  const activeLocId = selectedLocationId === 'all' ? 'Chennai' : selectedLocationId;
  const [records, setRecords] = useState<DailyClimateRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [activeMetric, setActiveMetric] = useState<'rainfall' | 'temperature' | 'moisture' | 'all'>('rainfall');
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Api.getForecastTimeline(activeLocId).then((res) => {
      if (isMounted) {
        setRecords(res.data.timeline);
        setSelectedDayIdx(Math.max(0, res.data.timeline.length - 1));
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeLocId]);

  const selectedRecord: DailyClimateRecord = records[selectedDayIdx] || records[0];

  // Chart coordinate bounds
  const chartWidth = 840;
  const chartHeight = 260;
  const paddingX = 40;
  const paddingY = 30;

  const safeLength = Math.max(1, records.length);
  const maxRainfall = Math.max(120, ...(records.length > 0 ? records.map((r) => r.rainfall1d) : [120]));
  const minTemp = 18;
  const maxTemp = 40;

  const getX = (idx: number) => paddingX + (idx / Math.max(1, safeLength - 1)) * (chartWidth - paddingX * 2);
  const getRainY = (val: number) => chartHeight - paddingY - (val / maxRainfall) * (chartHeight - paddingY * 2);
  const getTempY = (val: number) => chartHeight - paddingY - ((val - minTemp) / (maxTemp - minTemp)) * (chartHeight - paddingY * 2);
  const getMoistureY = (val: number) => chartHeight - paddingY - ((val - 0.1) / (0.6 - 0.1)) * (chartHeight - paddingY * 2);

  // SVG path generators
  const rainfallPath = records
    .map((r, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getRainY(r.rainfall1d)}`)
    .join(' ');
  const rainfall7dPath = records
    .map((r, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getRainY(r.rainfall7d / 3)}`)
    .join(' ');
  const tempMaxPath = records
    .map((r, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getTempY(r.temperatureMax)}`)
    .join(' ');
  const tempMeanPath = records
    .map((r, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getTempY(r.temperatureMean)}`)
    .join(' ');
  const moisturePath = records
    .map((r, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getMoistureY(r.soilMoisture)}`)
    .join(' ');

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Historical Timeline &amp; Observation Trajectory
            </h2>
            <ProvenanceBadge source="Uploaded Dataset" field="date, rainfall_1d, temperature_max, soil_moisture" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Day-by-day meteorological trajectory across all 31 days of July 2023 for {activeLocId}.
          </p>
        </div>

        {/* Metric Series Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs self-start md:self-auto">
          <button
            onClick={() => setActiveMetric('rainfall')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeMetric === 'rainfall'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Precipitation (mm)
          </button>
          <button
            onClick={() => setActiveMetric('temperature')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeMetric === 'temperature'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Thermal Curve (°C)
          </button>
          <button
            onClick={() => setActiveMetric('moisture')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeMetric === 'moisture'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Soil Saturation
          </button>
          <button
            onClick={() => setActiveMetric('all')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeMetric === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Multi-Variable
          </button>
        </div>
      </div>

      {/* Main Interactive Chart Container */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        {/* Scrubber and Date Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              July 01 - July 31, 2023 Sequence
            </span>
            <span className="text-xs text-slate-500">
              (Viewing Day {selectedDayIdx + 1}: <strong className="text-slate-900 dark:text-white font-mono">{selectedRecord?.date}</strong>)
            </span>
          </div>

          {/* Interactive Day Scrub Slider */}
          <div className="flex items-center gap-3 w-full sm:w-72">
            <span className="text-xs text-slate-500 font-mono">Jul 01</span>
            <input
              type="range"
              min="0"
              max={records.length - 1}
              value={selectedDayIdx}
              onChange={(e) => setSelectedDayIdx(parseInt(e.target.value, 10))}
              className="w-full accent-slate-900 dark:accent-white cursor-pointer"
            />
            <span className="text-xs text-slate-500 font-mono">Jul 31</span>
          </div>
        </div>

        {/* SVG Time Series Chart */}
        <div className="relative w-full overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto min-w-[640px]">
            {/* Horizontal Grid lines */}
            <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="currentColor" strokeDasharray="3 3" className="text-slate-100 dark:text-slate-800" />
            <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="currentColor" strokeDasharray="3 3" className="text-slate-100 dark:text-slate-800" />
            <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="currentColor" className="text-slate-200 dark:text-slate-700" />

            {/* Precipitation Series (Daily Bar & Area/Line) */}
            {(activeMetric === 'rainfall' || activeMetric === 'all') && (
              <>
                {/* 24h Rainfall Daily Columns */}
                {records.map((r, i) => {
                  const x = getX(i);
                  const y = getRainY(r.rainfall1d);
                  const h = chartHeight - paddingY - y;
                  return (
                    <rect
                      key={`bar-${i}`}
                      x={x - 4}
                      y={y}
                      width="8"
                      height={Math.max(0, h)}
                      fill="#0284C7"
                      fillOpacity={i === selectedDayIdx ? '0.9' : '0.4'}
                      className="transition-all hover:fill-opacity-100 cursor-pointer"
                      onClick={() => setSelectedDayIdx(i)}
                    />
                  );
                })}

                {/* 7-Day Cumulative Trend line */}
                <path d={rainfall7dPath} fill="none" stroke="#2563EB" strokeWidth="2" strokeDasharray="4 2" />
              </>
            )}

            {/* Thermal Series */}
            {(activeMetric === 'temperature' || activeMetric === 'all') && (
              <>
                <path d={tempMaxPath} fill="none" stroke="#E11D48" strokeWidth="2.5" />
                <path d={tempMeanPath} fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 3" />
              </>
            )}

            {/* Soil Moisture Series */}
            {(activeMetric === 'moisture' || activeMetric === 'all') && (
              <path d={moisturePath} fill="none" stroke="#059669" strokeWidth="2.5" />
            )}

            {/* Ground Truth Hazard Flag Markers (Flood, Drought, Heat) */}
            {records.map((r, i) => {
              const x = getX(i);
              if (r.floodLabel === 1) {
                return (
                  <g key={`hazard-flood-${i}`}>
                    <circle cx={x} cy={paddingY + 10} r="4" fill="#2563EB" />
                    <text x={x} y={paddingY + 7} textAnchor="middle" className="text-[9px] fill-white font-bold">F</text>
                  </g>
                );
              }
              if (r.droughtLabel === 1) {
                return (
                  <g key={`hazard-drought-${i}`}>
                    <circle cx={x} cy={paddingY + 10} r="4" fill="#D97706" />
                    <text x={x} y={paddingY + 7} textAnchor="middle" className="text-[9px] fill-white font-bold">D</text>
                  </g>
                );
              }
              if (r.heatLabel === 1) {
                return (
                  <g key={`hazard-heat-${i}`}>
                    <circle cx={x} cy={paddingY + 10} r="4" fill="#E11D48" />
                    <text x={x} y={paddingY + 7} textAnchor="middle" className="text-[9px] fill-white font-bold">H</text>
                  </g>
                );
              }
              return null;
            })}

            {/* Active Selected Day Scrubber Line */}
            <line
              x1={getX(selectedDayIdx)}
              y1={paddingY}
              x2={getX(selectedDayIdx)}
              y2={chartHeight - paddingY}
              stroke="#0F172A"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              className="dark:stroke-white"
            />
            <circle
              cx={getX(selectedDayIdx)}
              cy={chartHeight - paddingY}
              r="4"
              fill="#0F172A"
              className="dark:fill-white"
            />
          </svg>

          {/* Chart Legend */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-sky-600" /> 24h Rain (mm)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-blue-600 border-dashed" /> 7d Accumulation (Scaled)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-rose-600" /> Max Temp (°C)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-emerald-600" /> Soil Moisture (m³/m³)
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-blue-600 font-semibold">[F] Flood Label</span>
              <span className="text-amber-600 font-semibold">[D] Drought Label</span>
              <span className="text-rose-600 font-semibold">[H] Heatwave Label</span>
            </div>
          </div>
        </div>

        {/* Selected Day Telemetry Card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-slate-900 dark:text-white">
                Observation Date: {selectedRecord?.date}
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs text-slate-600 dark:text-slate-300">
                Station: <strong>{selectedRecord?.locationId}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              {selectedRecord?.floodLabel === 1 && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                  Ground Truth Flood (flood_label = 1)
                </span>
              )}
              {selectedRecord?.droughtLabel === 1 && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                  Ground Truth Drought (drought_label = 1)
                </span>
              )}
              {selectedRecord?.heatLabel === 1 && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
                  Ground Truth Heatwave (heat_label = 1)
                </span>
              )}
              {selectedRecord?.floodLabel === 0 && selectedRecord?.droughtLabel === 0 && selectedRecord?.heatLabel === 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                  Nominal Conditions (Labels = 0)
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
            <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 block text-[11px]">Daily Precip</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                {selectedRecord?.rainfall1d.toFixed(1)} mm
              </span>
            </div>
            <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 block text-[11px]">7-Day Cumulative</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                {selectedRecord?.rainfall7d.toFixed(1)} mm
              </span>
            </div>
            <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 block text-[11px]">Max Temperature</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                {selectedRecord?.temperatureMax.toFixed(1)} °C
              </span>
            </div>
            <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 block text-[11px]">Soil Moisture</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                {(selectedRecord?.soilMoisture || 0).toFixed(3)}
              </span>
            </div>
            <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 block text-[11px]">Niño 3.4 SST</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                +{selectedRecord?.nino34.toFixed(2)} °C
              </span>
            </div>
            <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 block text-[11px]">NDVI Vigor</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                {selectedRecord?.ndvi.toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
