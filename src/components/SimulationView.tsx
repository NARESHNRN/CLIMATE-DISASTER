import React, { useState, useEffect } from 'react';
import { Api } from '../services/api';
import { ClimateRiskService } from '../services/climateRiskService';
import { SimulationParameters, WhatIfResponse } from '../data/types';
import { ProvenanceBadge } from './ProvenanceBadge';
import {
  Sliders,
  Play,
  RotateCcw,
  CloudRain,
  Flame,
  Droplets,
  TrendingUp,
  AlertTriangle,
  Info,
  RefreshCw,
  Waves,
} from 'lucide-react';

interface SimulationViewProps {
  auditProvenance: boolean;
  onSelectLocation: (locId: string) => void;
}

export const SimulationView: React.FC<SimulationViewProps> = ({
  auditProvenance,
  onSelectLocation,
}) => {
  const [params, setParams] = useState<SimulationParameters>({
    temperatureOffsetC: 1.5,
    rainfallMultiplier: 1.25,
    soilMoistureSaturationOffset: 0.05,
    nino34AnomalyShift: 0.5,
  });

  const [simLocation, setSimLocation] = useState<string>('Chennai');
  const [whatIfResult, setWhatIfResult] = useState<WhatIfResponse | null>(null);
  const [loadingSim, setLoadingSim] = useState<boolean>(false);

  // Synchronous multi-station projection
  const simResult = ClimateRiskService.runSimulation(params);

  // Trigger POST /api/what-if
  const executeWhatIf = async () => {
    setLoadingSim(true);
    const rainPct = Math.round((params.rainfallMultiplier - 1.0) * 100);
    const riverPct = Math.round(rainPct * 0.6);

    const res = await Api.runWhatIfSimulation(simLocation, {
      rainfallChangePercent: rainPct,
      temperatureChangeCelsius: params.temperatureOffsetC,
      riverLevelChangePercent: riverPct,
    });

    setWhatIfResult(res.data);
    setLoadingSim(false);
  };

  useEffect(() => {
    executeWhatIf();
  }, [params, simLocation]);

  const resetParams = () => {
    setParams({
      temperatureOffsetC: 0.0,
      rainfallMultiplier: 1.0,
      soilMoistureSaturationOffset: 0.0,
      nino34AnomalyShift: 0.0,
    });
  };

  return (
    <div className="space-y-6">
      {/* Simulation Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Counterfactual Climate Stress Sandbox
            </h2>
            <ProvenanceBadge source="Demo / Simulated" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulates dynamic multi-hazard sensitivity by perturbing uploaded weather variables and calculating projected impact shifts.
          </p>
        </div>

        <button
          onClick={resetParams}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 bg-slate-100 dark:bg-slate-800 rounded-md transition-colors self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Baseline
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Panel (4 Columns) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Stress Parameters
            </h3>
            <span className="text-[11px] font-mono text-slate-400">runSimulation()</span>
          </div>

          {/* Slider 1: Rainfall Multiplier */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5 text-sky-500" /> Precipitation Intensity
              </span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                {params.rainfallMultiplier.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={params.rainfallMultiplier}
              onChange={(e) =>
                setParams((p) => ({ ...p, rainfallMultiplier: parseFloat(e.target.value) }))
              }
              className="w-full accent-slate-900 dark:accent-white cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0.50x (Deficit)</span>
              <span>1.0x (Observed)</span>
              <span>2.50x (Extreme Surge)</span>
            </div>
          </div>

          {/* Slider 2: Temperature Offset */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-rose-500" /> Temperature Anomaly Delta
              </span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                {params.temperatureOffsetC >= 0 ? '+' : ''}{params.temperatureOffsetC.toFixed(1)} °C
              </span>
            </div>
            <input
              type="range"
              min="-2.0"
              max="4.0"
              step="0.2"
              value={params.temperatureOffsetC}
              onChange={(e) =>
                setParams((p) => ({ ...p, temperatureOffsetC: parseFloat(e.target.value) }))
              }
              className="w-full accent-slate-900 dark:accent-white cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>-2.0 °C (Cooler)</span>
              <span>0.0 °C (Observed)</span>
              <span>+4.0 °C (Severe Warming)</span>
            </div>
          </div>

          {/* Slider 3: Soil Moisture Offset */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-500" /> Antecedent Soil Saturation Shift
              </span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                {params.soilMoistureSaturationOffset >= 0 ? '+' : ''}{(params.soilMoistureSaturationOffset * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="-0.15"
              max="0.20"
              step="0.01"
              value={params.soilMoistureSaturationOffset}
              onChange={(e) =>
                setParams((p) => ({
                  ...p,
                  soilMoistureSaturationOffset: parseFloat(e.target.value),
                }))
              }
              className="w-full accent-slate-900 dark:accent-white cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>-15% (Dry Bed)</span>
              <span>0% (Observed)</span>
              <span>+20% (Supersaturated)</span>
            </div>
          </div>

          {/* Slider 4: Niño 3.4 SST Shift */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" /> Niño 3.4 Teleconnection Shift
              </span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                {params.nino34AnomalyShift >= 0 ? '+' : ''}{params.nino34AnomalyShift.toFixed(2)} °C
              </span>
            </div>
            <input
              type="range"
              min="-1.5"
              max="2.5"
              step="0.1"
              value={params.nino34AnomalyShift}
              onChange={(e) =>
                setParams((p) => ({ ...p, nino34AnomalyShift: parseFloat(e.target.value) }))
              }
              className="w-full accent-slate-900 dark:accent-white cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>-1.5 °C (La Niña)</span>
              <span>0.0 °C (Observed)</span>
              <span>+2.5 °C (Super El Niño)</span>
            </div>
          </div>
        </div>

        {/* Output Projection Results (7 Columns) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                Simulation Endpoint Response
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  POST /api/what-if
                </span>
              </h3>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold uppercase text-[10px] tracking-wider mt-0.5">
                {whatIfResult?.disclaimer || 'SIMULATION — NOT AN OFFICIAL FORECAST'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="sim-loc" className="text-xs text-slate-500">Location:</label>
              <select
                id="sim-loc"
                value={simLocation}
                onChange={(e) => setSimLocation(e.target.value)}
                className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1"
              >
                <option value="Chennai">Chennai</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Coimbatore">Coimbatore</option>
                <option value="Madurai">Madurai</option>
                <option value="Visakhapatnam">Visakhapatnam</option>
              </select>
            </div>
          </div>

          {/* What-If Live Card */}
          {whatIfResult && (
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {whatIfResult.message}
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  Impact: <strong className="text-rose-600 dark:text-rose-400">{whatIfResult.infrastructureImpact}</strong>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Baseline Risk</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-base">{whatIfResult.baselineRisk}</span>
                </div>
                <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Simulated Risk</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-base">{whatIfResult.simulatedRisk}</span>
                </div>
                <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Risk Change</span>
                  <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                    {whatIfResult.riskChange >= 0 ? '+' : ''}{whatIfResult.riskChange} pts
                  </span>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-600 dark:text-slate-300">
            {simResult.impactSummary}
          </p>

          {/* Metric Comparison Badges */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
              <span className="text-blue-800 dark:text-blue-300 block text-[11px] font-medium">Projected Flood Days</span>
              <span className="text-xl font-bold font-mono text-blue-900 dark:text-blue-100">
                {simResult.projectedFloodDays} <span className="text-xs font-normal text-slate-500">days</span>
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Observed: 51 days</span>
            </div>

            <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <span className="text-amber-800 dark:text-amber-300 block text-[11px] font-medium">Projected Drought Days</span>
              <span className="text-xl font-bold font-mono text-amber-900 dark:text-amber-100">
                {simResult.projectedDroughtDays} <span className="text-xs font-normal text-slate-500">days</span>
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Observed: 31 days</span>
            </div>

            <div className="p-3 rounded-lg bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
              <span className="text-rose-800 dark:text-rose-300 block text-[11px] font-medium">Projected Heat Stress</span>
              <span className="text-xl font-bold font-mono text-rose-900 dark:text-rose-100">
                {simResult.projectedHeatDays} <span className="text-xs font-normal text-slate-500">days</span>
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Observed: 4 days</span>
            </div>
          </div>

          {/* Station Shift Table */}
          <div className="pt-2">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-2">
              Station Sensitivity Breakdown
            </span>
            <div className="max-h-[220px] overflow-y-auto pr-1">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[10px] uppercase">
                    <th className="py-2 px-2">Station</th>
                    <th className="py-2 px-2">Baseline Risk</th>
                    <th className="py-2 px-2">Simulated Risk</th>
                    <th className="py-2 px-2">Hazard Shift</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {simResult.affectedLocations.map((loc) => (
                    <tr
                      key={loc.locationId}
                      onClick={() => onSelectLocation(loc.locationId)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                    >
                      <td className="py-2 px-2 font-medium text-slate-900 dark:text-white">
                        {loc.locationId}
                      </td>
                      <td className="py-2 px-2 font-mono text-slate-600 dark:text-slate-400">
                        {loc.originalRiskScore}
                      </td>
                      <td className="py-2 px-2 font-mono font-semibold text-slate-900 dark:text-white">
                        {loc.simulatedRiskScore}
                      </td>
                      <td className="py-2 px-2">
                        <span className="text-[11px] text-slate-600 dark:text-slate-300">
                          {loc.hazardChange}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
