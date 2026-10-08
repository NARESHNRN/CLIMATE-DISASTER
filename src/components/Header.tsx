import React, { useState } from 'react';
import { Database, ShieldAlert, Sparkles, Download, Settings, Server, Check, X, ShieldCheck } from 'lucide-react';
import { CLIMATE_DATASET_RECORDS } from '../data/dataset';
import { GlobalApiMode, Api } from '../services/api';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  auditProvenance: boolean;
  setAuditProvenance: (val: boolean) => void;
  apiMode: GlobalApiMode;
  setApiMode: (mode: GlobalApiMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  auditProvenance,
  setAuditProvenance,
  apiMode,
  setApiMode,
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempBaseUrl, setTempBaseUrl] = useState(() => Api.getBaseUrl());
  const [saveNotice, setSaveNotice] = useState(false);
  const exportDataset = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      encodeURIComponent(
        'location_id,date,latitude,longitude,temperature_mean,temperature_max,rainfall_1d,rainfall_3d,rainfall_7d,rainfall_30d,soil_moisture,oni,nino34,ndvi,flood_label,drought_label,heat_label\n' +
          CLIMATE_DATASET_RECORDS.map((r) =>
            [
              r.locationId,
              r.date,
              r.latitude,
              r.longitude,
              r.temperatureMean,
              r.temperatureMax,
              r.rainfall1d,
              r.rainfall3d,
              r.rainfall7d,
              r.rainfall30d,
              r.soilMoisture,
              r.oni,
              r.nino34,
              r.ndvi,
              r.floodLabel,
              r.droughtLabel,
              r.heatLabel,
            ].join(',')
          ).join('\n')
      );
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', 'climrisk_uploaded_dataset.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'map', label: 'Geo Risk Map' },
    { id: 'timeline', label: 'Forecast Timeline' },
    { id: 'lstm', label: 'LSTM Predictor' },
    { id: 'enso', label: 'ENSO Telemetry' },
    { id: 'recommendations', label: 'Action Playbook' },
    { id: 'simulation', label: 'Scenario Simulator' },
    { id: 'benchmark', label: 'Model Metrics' },
    { id: 'inspector', label: 'Dataset Lineage' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single element Brand wordmark in display styling */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-left group flex items-center gap-2.5 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  ClimaRisk AI
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs text-slate-500 dark:text-slate-400">
                  Resilience Intelligence
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Clean 4-8 text navigation links with active state */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary functional action controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Multi-Mode API Switcher: Demo -> FastAPI -> Live */}
            <button
              onClick={() => {
                const nextMode: GlobalApiMode =
                  apiMode === 'demo' ? 'fastapi' : apiMode === 'fastapi' ? 'live' : 'demo';
                setApiMode(nextMode);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-all ${
                apiMode === 'live'
                  ? 'bg-sky-50 border-sky-300 text-sky-800 dark:bg-sky-950/60 dark:border-sky-700 dark:text-sky-200'
                  : apiMode === 'fastapi'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-200'
                  : 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/60 dark:border-amber-700 dark:text-amber-200'
              }`}
              title="Click to cycle API mode: Demo (Local dataset) -> FastAPI (External server :8000) -> Live (Open-Meteo)"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  apiMode === 'live'
                    ? 'bg-sky-500 animate-pulse'
                    : apiMode === 'fastapi'
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-amber-500'
                }`}
              />
              <span className="hidden sm:inline">API:</span>
              <span className="font-semibold uppercase text-[11px]">{apiMode}</span>
            </button>

            {/* Provenance Audit Switch */}
            <button
              onClick={() => setAuditProvenance(!auditProvenance)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-all ${
                auditProvenance
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-200'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
              }`}
              title="Toggle highlighting of fields originating directly from the uploaded dataset vs simulated demo extensions"
            >
              <Database className={`w-3.5 h-3.5 ${auditProvenance ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Trace</span>
              <span>Provenance</span>
            </button>

            {/* Settings & Backend Config */}
            <button
              onClick={() => {
                setTempBaseUrl(Api.getBaseUrl());
                setShowConfigModal(true);
              }}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors"
              title="API & Backend Server Settings (Configure Base URL or verify keyless mode)"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>

            {/* Export Raw CSV */}
            <button
              onClick={exportDataset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition-colors"
              title="Download original multi-station dataset (310 records)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span> CSV
            </button>
          </div>
        </div>

        {/* API & Server Config Modal */}
        {showConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6 space-y-5 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      API &amp; Backend Settings
                    </h3>
                    <p className="text-[11px] text-slate-500">Autonomous, Keyless Architecture</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Notice */}
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <div className="space-y-0.5">
                  <p className="font-semibold">No API Keys Required</p>
                  <p className="text-[11px] leading-relaxed text-emerald-700 dark:text-emerald-400">
                    This platform operates completely self-contained. It uses the uploaded multi-station climate dataset (310 records) and Open-Meteo's open weather API with automatic local fallback.
                  </p>
                </div>
              </div>

              {/* API Mode Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Active Mode
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    onClick={() => {
                      setApiMode('demo');
                      Api.setApiMode('demo');
                    }}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      apiMode === 'demo'
                        ? 'border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Demo / Local
                    <span className="block text-[10px] font-normal text-slate-500">Self-Contained</span>
                  </button>
                  <button
                    onClick={() => {
                      setApiMode('live');
                      Api.setApiMode('live');
                    }}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      apiMode === 'live'
                        ? 'border-sky-400 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-200 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Live Weather
                    <span className="block text-[10px] font-normal text-slate-500">Open-Meteo (No Key)</span>
                  </button>
                  <button
                    onClick={() => {
                      setApiMode('fastapi');
                      Api.setApiMode('fastapi');
                    }}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      apiMode === 'fastapi'
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    FastAPI
                    <span className="block text-[10px] font-normal text-slate-500">Custom Server</span>
                  </button>
                </div>
              </div>

              {/* FastAPI Base URL Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    FastAPI Base URL
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Default: http://localhost:8000</span>
                </div>
                <input
                  type="text"
                  value={tempBaseUrl}
                  onChange={(e) => setTempBaseUrl(e.target.value)}
                  placeholder="http://localhost:8000"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-500 leading-normal">
                  If you run a local Python FastAPI backend, enter its URL here. If unreachable, the app automatically falls back to local data so nothing breaks.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  {saveNotice && (
                    <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                      <Check className="w-3.5 h-3.5" /> Saved!
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      Api.setBaseUrl(tempBaseUrl);
                      setSaveNotice(true);
                      setTimeout(() => setSaveNotice(false), 2000);
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    Save URL
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile secondary tab strip */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto py-2.5 border-t border-slate-100 dark:border-slate-800 no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
                activeTab === item.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
