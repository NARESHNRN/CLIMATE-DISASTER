import React, { useState, useEffect } from 'react';
import {
  DailyClimateRecord,
  WeatherResponse,
  RiskApiResponse,
  PredictionsResponse,
  AlertApiResponse,
  RoleRecommendationResponse,
  RoleType,
} from '../data/types';
import { Api } from '../services/api';
import { ClimateRiskService } from '../services/climateRiskService';
import { ProvenanceBadge } from './ProvenanceBadge';
import {
  CloudRain,
  Sun,
  Flame,
  Droplets,
  Wind,
  Gauge,
  Leaf,
  Layers,
  TrendingUp,
  AlertOctagon,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Users,
  Building2,
  Tractor,
  HeartPulse,
  Workflow,
  Sparkles,
  Info,
} from 'lucide-react';

interface DashboardViewProps {
  records: DailyClimateRecord[];
  selectedLocationId: string;
  onSelectLocation: (locId: string) => void;
  auditProvenance: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  records,
  selectedLocationId,
  onSelectLocation,
  auditProvenance,
}) => {
  const activeLocId = selectedLocationId === 'all' ? 'Chennai' : selectedLocationId;

  // Asynchronous API states
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(true);

  const [riskData, setRiskData] = useState<RiskApiResponse | null>(null);
  const [loadingRisk, setLoadingRisk] = useState<boolean>(true);

  const [predictionsData, setPredictionsData] = useState<PredictionsResponse | null>(null);
  const [loadingPredictions, setLoadingPredictions] = useState<boolean>(true);

  const [alertsData, setAlertsData] = useState<AlertApiResponse[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState<boolean>(true);

  const [activeRole, setActiveRole] = useState<RoleType>('resident');
  const [roleRecs, setRoleRecs] = useState<RoleRecommendationResponse | null>(null);
  const [loadingRecs, setLoadingRecs] = useState<boolean>(true);

  const [pipelineData, setPipelineData] = useState<{
    stages: Array<{ stage: string; status: string; latencyMs: number; details: string }>;
    totalLatencyMs: number;
    pipelineMode: string;
  } | null>(null);

  // Synchronous dataset fallback structures for explainable factors & ENSO
  const riskProfile = ClimateRiskService.getRisk(activeLocId);
  const ensoState = ClimateRiskService.getEnsoForecast();

  // Selected date or latest record from filtered set
  const latestRecord = records[records.length - 1] || records[0];

  const peakRainfallRecord = records.reduce(
    (prev, curr) => (curr.rainfall1d > prev.rainfall1d ? curr : prev),
    records[0] || latestRecord
  );
  const peakTempRecord = records.reduce(
    (prev, curr) => (curr.temperatureMax > prev.temperatureMax ? curr : prev),
    records[0] || latestRecord
  );
  const floodCount = records.filter((r) => r.floodLabel === 1).length;
  const droughtCount = records.filter((r) => r.droughtLabel === 1).length;
  const heatCount = records.filter((r) => r.heatLabel === 1).length;

  // Asynchronous Backend API Fetch Workflow
  useEffect(() => {
    let isMounted = true;

    async function loadApiData() {
      // 1. Weather API
      setLoadingWeather(true);
      Api.getWeather(activeLocId).then((res) => {
        if (isMounted) {
          setWeatherData(res.data);
          setLoadingWeather(false);
        }
      });

      // 2. Risk API
      setLoadingRisk(true);
      Api.getRisk(activeLocId).then((res) => {
        if (isMounted) {
          setRiskData(res.data);
          setLoadingRisk(false);
        }
      });

      // 3. Predictions API
      setLoadingPredictions(true);
      Api.getPredictions(activeLocId).then((res) => {
        if (isMounted) {
          setPredictionsData(res.data);
          setLoadingPredictions(false);
        }
      });

      // 4. Alerts API
      setLoadingAlerts(true);
      Api.getAlerts(activeLocId).then((res) => {
        if (isMounted) {
          setAlertsData(res.data);
          setLoadingAlerts(false);
        }
      });

      // 5. Pipeline Status
      Api.getPipelineStatus(activeLocId).then((data) => {
        if (isMounted) setPipelineData(data);
      });
    }

    loadApiData();

    return () => {
      isMounted = false;
    };
  }, [activeLocId]);

  // Load recommendations when role or location changes
  useEffect(() => {
    let isMounted = true;
    setLoadingRecs(true);
    Api.getRecommendations(activeLocId, activeRole).then((res) => {
      if (isMounted) {
        setRoleRecs(res.data);
        setLoadingRecs(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeLocId, activeRole]);

  return (
    <div className="space-y-6">
      {/* 1. Mandatory Safety & Governance Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 border border-slate-800 dark:border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 dark:text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
          <p className="leading-relaxed">
            <strong>Safety &amp; Compliance Statement:</strong> This platform provides AI-based risk estimation and decision support. It does not replace official meteorological or emergency warnings.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono shrink-0">
          <span className="px-2 py-0.5 rounded bg-slate-800 dark:bg-slate-100 text-slate-300 dark:text-slate-700">AI Prediction</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 dark:bg-slate-100 text-slate-300 dark:text-slate-700">Official Warning</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 dark:bg-slate-100 text-slate-300 dark:text-slate-700">Historical Data</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 dark:bg-slate-100 text-slate-300 dark:text-slate-700">Simulation</span>
        </div>
      </div>

      {/* 2. Operational Dataset & Live Telemetry Banner */}
      <div className={`p-4 rounded-xl border transition-all ${
        auditProvenance
          ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-500/20'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Multi-Source Operations: {activeLocId} Hub Active
                </h2>
                {weatherData?.dataMode === 'live' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Open-Meteo Live API Active
                  </span>
                ) : (
                  <ProvenanceBadge source="Uploaded Dataset" />
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Targeting {activeLocId}, Tamil Nadu, India. Integrated with 310 daily station records, equatorial Pacific Niño 3.4 SST telemetry (+{ensoState.currentNino34}°C), and real-time open weather services.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 shrink-0">
            <span>ONI: {ensoState.currentOni.toFixed(1)}</span>
            <span aria-hidden="true">·</span>
            <span>Niño 3.4: +{ensoState.currentNino34}°C</span>
          </div>
        </div>
      </div>

      {/* 3. Live Weather Telemetry (GET /api/weather) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-500" />
              Meteorological Telemetry: {weatherData?.location || activeLocId}
            </h3>
            {weatherData?.dataMode === 'live' ? (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
                Live Data (Open-Meteo)
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 uppercase tracking-wider">
                Demo / Dataset Fallback
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400 font-mono">
            GET /api/weather?location={activeLocId}
          </div>
        </div>

        {loadingWeather ? (
          <div className="py-8 flex items-center justify-center gap-2 text-xs text-slate-500">
            <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
            <span>Loading weather &amp; environmental telemetry from Open-Meteo...</span>
          </div>
        ) : weatherData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 block mb-0.5">Surface Temp</span>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {weatherData.current.temperature.toFixed(1)} <span className="text-xs font-normal text-slate-500">°C</span>
                </div>
                <span className="text-[10px] text-slate-400">{weatherData.current.conditionText || 'Partly Cloudy'}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 block mb-0.5">Relative Humidity</span>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {weatherData.current.humidity} <span className="text-xs font-normal text-slate-500">%</span>
                </div>
                <span className="text-[10px] text-slate-400">Atmospheric Vapor</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 block mb-0.5">Precipitation</span>
                <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">
                  {weatherData.current.rainfall.toFixed(1)} <span className="text-xs font-normal text-slate-500">mm</span>
                </div>
                <span className="text-[10px] text-slate-400">24h Rate</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 block mb-0.5">Wind Velocity</span>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {weatherData.current.windSpeed.toFixed(1)} <span className="text-xs font-normal text-slate-500">km/h</span>
                </div>
                <span className="text-[10px] text-slate-400">Surface Anemometer</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 block mb-0.5">Surface Pressure</span>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {weatherData.current.pressure.toFixed(1)} <span className="text-xs font-normal text-slate-500">hPa</span>
                </div>
                <span className="text-[10px] text-slate-400">Synoptic Pressure</span>
              </div>
            </div>

            {/* 7-Day Forecast Strip from Open-Meteo */}
            {weatherData.forecast && weatherData.forecast.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>7-Day Meteorological Horizon</span>
                  <span className="font-mono text-[10px]">Source: {weatherData.source}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                  {weatherData.forecast.slice(0, 7).map((fc, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center text-xs">
                      <span className="text-[10px] font-mono text-slate-400 block">{fc.time.slice(5)}</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white block mt-0.5">{fc.temperature.toFixed(0)}°C</span>
                      <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400">{fc.rainfall.toFixed(1)}mm</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* 4. Multi-Hazard Predictions API (GET /api/predictions) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Multi-Hazard Predictive Estimations: {activeLocId}
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider">
                DEMO PREDICTION
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              API endpoint `GET /api/predictions` generating 24–48h probabilistic outlooks across Flood, Drought, and Heatwave.
            </p>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Window: {predictionsData?.forecastWindow || '24–48 hours'}
          </div>
        </div>

        {loadingPredictions ? (
          <div className="py-8 flex items-center justify-center gap-2 text-xs text-slate-500">
            <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
            <span>Loading predictions across multi-hazard models...</span>
          </div>
        ) : predictionsData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {predictionsData.predictions.map((pred) => (
              <div
                key={pred.hazard}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {pred.hazard === 'Flood' && <CloudRain className="w-4 h-4 text-blue-500" />}
                      {pred.hazard === 'Drought' && <Droplets className="w-4 h-4 text-amber-500" />}
                      {pred.hazard === 'Heatwave' && <Flame className="w-4 h-4 text-rose-500" />}
                      {pred.hazard}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                      pred.riskScore >= 75
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : pred.riskScore >= 50
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      Score: {pred.riskScore}/100
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Probability</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {(pred.probability * 100).toFixed(0)}% ({pred.confidence} Confidence)
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Trend / Window</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {pred.trend} · {pred.forecastWindow}
                    </span>
                  </div>

                  <div className="mt-2.5 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Major Contributing Factors</span>
                    <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                      {pred.majorFactors.map((factor, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-slate-400" />
                          <span className="truncate">{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Model: {pred.model}</span>
                  <span>{pred.modelVersion}</span>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* 5. Role-Based Recommendations API (GET /api/recommendations?role={role}) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Decision-Support Recommendations Playbook: {activeLocId}
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 uppercase tracking-wider">
                GET /api/recommendations
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tailored guidance for resident, farmer, authority, and hospital stakeholders based on active risk level.
            </p>
          </div>

          {/* Role Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs self-start sm:self-auto">
            <button
              onClick={() => setActiveRole('resident')}
              className={`flex items-center gap-1 px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeRole === 'resident'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Resident
            </button>
            <button
              onClick={() => setActiveRole('authority')}
              className={`flex items-center gap-1 px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeRole === 'authority'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Authority
            </button>
            <button
              onClick={() => setActiveRole('farmer')}
              className={`flex items-center gap-1 px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeRole === 'farmer'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Tractor className="w-3.5 h-3.5" /> Farmer
            </button>
            <button
              onClick={() => setActiveRole('hospital')}
              className={`flex items-center gap-1 px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeRole === 'hospital'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" /> Hospital
            </button>
          </div>
        </div>

        {loadingRecs ? (
          <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-500">
            <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
            <span>Loading decision-support recommendations...</span>
          </div>
        ) : roleRecs ? (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Actionable Protocols for <span className="capitalize">{activeRole}</span> ({roleRecs.hazard} · {roleRecs.riskLevel} Risk)
              </span>
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
                {roleRecs.typeLabel}
              </span>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {roleRecs.recommendations.map((rec, i) => (
                <li key={i} className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-800 dark:text-slate-200">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {/* 6. Active Disaster Alerts (GET /api/alerts) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Disaster Early Warning Alerts: {activeLocId}
            </h3>
            <p className="text-xs text-slate-500">
              API endpoint `GET /api/alerts` with formal separation between AI estimation and statutory civil defense orders.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {alertsData.length} Registered Alerts
          </span>
        </div>

        {loadingAlerts ? (
          <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-500">
            <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
            <span>Loading active alerts...</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {alertsData.map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                      alert.status === 'Critical'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                        : alert.status === 'Warning'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200'
                        : alert.status === 'Advisory'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                    }`}>
                      {alert.status}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {alert.hazard} · {alert.location}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{alert.id}</span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300">
                  {alert.message}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1.5 border-t border-slate-200/50 dark:border-slate-700/50 text-[11px] text-slate-500">
                  <span>Source: <strong className="text-slate-700 dark:text-slate-300">{alert.sourceType}</strong> (Probability: {(alert.probability * 100).toFixed(0)}%)</span>
                  {alert.officialNoticeDisclaimer && (
                    <span className="italic text-[10px] text-slate-400">{alert.officialNoticeDisclaimer}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. 10-Stage Data Pipeline Architecture Simulation */}
      {pipelineData && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Workflow className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                10-Stage Backend Pipeline Simulation ({pipelineData.pipelineMode})
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Total Latency: {pipelineData.totalLatencyMs} ms
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            {pipelineData.stages.map((st, i) => (
              <div key={i} className="p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block truncate">{st.stage}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">{st.status} ({st.latencyMs}ms)</span>
                <span className="text-[10px] text-slate-500 block truncate mt-0.5" title={st.details}>{st.details}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
