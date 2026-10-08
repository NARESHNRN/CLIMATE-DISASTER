import React, { useState, useMemo } from 'react';
import { CLIMATE_DATASET_RECORDS } from './data/dataset';
import { Header } from './components/Header';
import { FilterBar, FilterState } from './components/FilterBar';
import { DashboardView } from './components/DashboardView';
import { InteractiveMapView } from './components/InteractiveMapView';
import { ForecastTimelineView } from './components/ForecastTimelineView';
import { LstmVisualizerView } from './components/LstmVisualizerView';
import { EnsoClimateView } from './components/EnsoClimateView';
import { SimulationView } from './components/SimulationView';
import { ModelComparisonView } from './components/ModelComparisonView';
import { RecommendationsView } from './components/RecommendationsView';
import { DatasetInspectorView } from './components/DatasetInspectorView';
import { ProvenanceBadge } from './components/ProvenanceBadge';
import { Api, GlobalApiMode } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [auditProvenance, setAuditProvenance] = useState<boolean>(false);
  const [apiMode, setApiMode] = useState<GlobalApiMode>(Api.getApiMode());

  const handleSetApiMode = (mode: GlobalApiMode) => {
    setApiMode(mode);
    Api.setApiMode(mode);
  };

  const initialFilters: FilterState = {
    locationId: 'all',
    dateRangePreset: 'all',
    selectedDate: 'all',
    hazardType: 'all',
    riskLevel: 'all',
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Apply live filtering to the uploaded dataset
  const filteredRecords = useMemo(() => {
    return CLIMATE_DATASET_RECORDS.filter((rec) => {
      // 1. Location filter
      if (filters.locationId !== 'all' && rec.locationId.toLowerCase() !== filters.locationId.toLowerCase()) {
        return false;
      }

      // 2. Date range preset filter
      if (filters.dateRangePreset !== 'all') {
        const day = parseInt(rec.date.split('-')[2], 10);
        if (filters.dateRangePreset === 'w1' && (day < 1 || day > 7)) return false;
        if (filters.dateRangePreset === 'w2' && (day < 8 || day > 14)) return false;
        if (filters.dateRangePreset === 'w3' && (day < 15 || day > 21)) return false;
        if (filters.dateRangePreset === 'w4' && (day < 22 || day > 31)) return false;
      }

      // 3. Hazard filter
      if (filters.hazardType === 'flood' && rec.floodLabel !== 1) return false;
      if (filters.hazardType === 'drought' && rec.droughtLabel !== 1) return false;
      if (filters.hazardType === 'heat' && rec.heatLabel !== 1) return false;
      if (filters.hazardType === 'compound') {
        const hazardCount = (rec.floodLabel ? 1 : 0) + (rec.droughtLabel ? 1 : 0) + (rec.heatLabel ? 1 : 0);
        if (hazardCount < 1 && rec.riskScore < 60) return false;
      }

      // 4. Risk Level filter
      if (filters.riskLevel !== 'all' && rec.riskLevel !== filters.riskLevel) {
        return false;
      }

      return true;
    });
  }, [filters]);

  const handleSelectLocation = (locId: string) => {
    setFilters((prev) => ({ ...prev, locationId: locId }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-900">
      {/* 3-Zone Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        auditProvenance={auditProvenance}
        setAuditProvenance={setAuditProvenance}
        apiMode={apiMode}
        setApiMode={handleSetApiMode}
      />

      {/* Global Interactive Filter Bar */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        totalRecordsMatched={filteredRecords.length}
        onReset={handleResetFilters}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            records={filteredRecords}
            selectedLocationId={filters.locationId}
            onSelectLocation={handleSelectLocation}
            auditProvenance={auditProvenance}
          />
        )}

        {activeTab === 'map' && (
          <InteractiveMapView
            selectedLocationId={filters.locationId}
            onSelectLocation={handleSelectLocation}
            auditProvenance={auditProvenance}
          />
        )}

        {activeTab === 'timeline' && (
          <ForecastTimelineView
            selectedLocationId={filters.locationId}
            onSelectLocation={handleSelectLocation}
            auditProvenance={auditProvenance}
          />
        )}

        {activeTab === 'lstm' && (
          <LstmVisualizerView
            selectedLocationId={filters.locationId}
            onSelectLocation={handleSelectLocation}
            auditProvenance={auditProvenance}
          />
        )}

        {activeTab === 'enso' && (
          <EnsoClimateView auditProvenance={auditProvenance} />
        )}

        {activeTab === 'recommendations' && (
          <RecommendationsView
            selectedLocationId={filters.locationId}
            onSelectLocation={handleSelectLocation}
            auditProvenance={auditProvenance}
          />
        )}

        {activeTab === 'simulation' && (
          <SimulationView
            auditProvenance={auditProvenance}
            onSelectLocation={handleSelectLocation}
          />
        )}

        {activeTab === 'benchmark' && (
          <ModelComparisonView auditProvenance={auditProvenance} />
        )}

        {activeTab === 'inspector' && (
          <DatasetInspectorView auditProvenance={auditProvenance} />
        )}
      </main>

      {/* Clean Editorial Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 px-4 sm:px-6 lg:px-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 dark:text-white">ClimaRisk AI</span>
            <span aria-hidden="true">·</span>
            <span>Disaster Risk &amp; Resilience Platform</span>
            <span aria-hidden="true">·</span>
            <span>Frontend-First Architecture</span>
          </div>

          <div className="flex items-center gap-3">
            <ProvenanceBadge source="Uploaded Dataset" field="310 Daily + 537 ENSO + 920 ONI Records" />
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveTab('inspector')}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Dataset Lineage Report
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
