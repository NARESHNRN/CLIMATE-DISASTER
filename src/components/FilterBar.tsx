import React from 'react';
import { LOCATIONS_METADATA } from '../data/rawEnsoData';
import { MapPin, Calendar, AlertTriangle, Activity, RefreshCw } from 'lucide-react';
import { ProvenanceBadge } from './ProvenanceBadge';

export interface FilterState {
  locationId: string; // 'all' or locationId
  dateRangePreset: 'all' | 'w1' | 'w2' | 'w3' | 'w4';
  selectedDate: string; // 'all' or '2023-07-XX'
  hazardType: 'all' | 'flood' | 'drought' | 'heat' | 'compound';
  riskLevel: 'all' | 'Low' | 'Moderate' | 'High' | 'Severe' | 'Critical';
}

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalRecordsMatched: number;
  onReset: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  totalRecordsMatched,
  onReset,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Filter Controls Cluster */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Location Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <label htmlFor="filter-location" className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Station
            </label>
            <select
              id="filter-location"
              value={filters.locationId}
              onChange={(e) => setFilters((prev) => ({ ...prev, locationId: e.target.value }))}
              className="bg-transparent text-xs font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">All 10 Regions (National)</option>
              {LOCATIONS_METADATA.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.state})
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Preset */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <label htmlFor="filter-date" className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Date Span
            </label>
            <select
              id="filter-date"
              value={filters.dateRangePreset}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  dateRangePreset: e.target.value as FilterState['dateRangePreset'],
                  selectedDate: 'all',
                }))
              }
              className="bg-transparent text-xs font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">Full Month (July 1 - 31, 2023)</option>
              <option value="w1">Week 1 (July 01 - 07)</option>
              <option value="w2">Week 2 (July 08 - 14)</option>
              <option value="w3">Week 3 (July 15 - 21)</option>
              <option value="w4">Week 4 (July 22 - 31)</option>
            </select>
          </div>

          {/* Hazard Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <AlertTriangle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <label htmlFor="filter-hazard" className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Hazard
            </label>
            <select
              id="filter-hazard"
              value={filters.hazardType}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  hazardType: e.target.value as FilterState['hazardType'],
                }))
              }
              className="bg-transparent text-xs font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">All Hazard Conditions</option>
              <option value="flood">Flood Events (flood_label = 1)</option>
              <option value="drought">Drought Events (drought_label = 1)</option>
              <option value="heat">Heatwaves (heat_label = 1)</option>
              <option value="compound">Compound / Elevated Threat</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <Activity className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <label htmlFor="filter-risk" className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Risk Level
            </label>
            <select
              id="filter-risk"
              value={filters.riskLevel}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  riskLevel: e.target.value as FilterState['riskLevel'],
                }))
              }
              className="bg-transparent text-xs font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">All Risk Levels</option>
              <option value="Critical">Critical (Score 80-100)</option>
              <option value="Severe">Severe (Score 60-79)</option>
              <option value="High">High (Score 45-59)</option>
              <option value="Moderate">Moderate (Score 30-44)</option>
              <option value="Low">Low (Score &lt; 30)</option>
            </select>
          </div>

          {/* Reset Filters */}
          <button
            onClick={onReset}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            title="Reset all filters to default"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Traceability Status and Match Count */}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
              {totalRecordsMatched}
            </span>
            <span>daily station records active</span>
          </div>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <ProvenanceBadge source="Uploaded Dataset" field="location_id, date" />
        </div>
      </div>
    </div>
  );
};
