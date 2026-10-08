import React, { useState, useEffect } from 'react';
import { Api } from '../services/api';
import { ClimateRiskService } from '../services/climateRiskService';
import { VulnerabilityProfile, RoleType, RoleRecommendationResponse, RecommendationItem } from '../data/types';
import { ProvenanceBadge } from './ProvenanceBadge';
import {
  ShieldAlert,
  AlertTriangle,
  Droplets,
  HeartPulse,
  Wrench,
  CheckCircle2,
  Building2,
  TreePine,
  Activity,
  Users,
  Tractor,
  RefreshCw,
  Info,
} from 'lucide-react';

interface RecommendationsViewProps {
  selectedLocationId: string;
  onSelectLocation: (locId: string) => void;
  auditProvenance: boolean;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  selectedLocationId,
  onSelectLocation,
  auditProvenance,
}) => {
  const activeLocId = selectedLocationId === 'all' ? 'Mumbai' : selectedLocationId;

  const [vulnerability, setVulnerability] = useState<VulnerabilityProfile>(() =>
    ClimateRiskService.getVulnerability(activeLocId)
  );
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(() =>
    ClimateRiskService.getRecommendations(activeLocId)
  );
  const [activeRole, setActiveRole] = useState<RoleType>('resident');
  const [roleRecs, setRoleRecs] = useState<RoleRecommendationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      Api.getVulnerability(activeLocId),
      Api.getRecommendations(activeLocId, activeRole),
    ]).then(([vulnRes, recRes]) => {
      if (isMounted) {
        setVulnerability(vulnRes.data);
        setRoleRecs(recRes.data);
        setRecommendations(ClimateRiskService.getRecommendations(activeLocId));
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeLocId, activeRole]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Vulnerability Profile &amp; Resilience Playbook: {vulnerability.locationName}
            </h2>
            <ProvenanceBadge source="Demo / Simulated" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Actionable disaster management protocols triggered by threshold crossings in the uploaded observation dataset.
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Fetching backend data...</span>
          </div>
        )}
      </div>

      {/* Vulnerability Index Scorecards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 block mb-1">Physical Exposure</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {vulnerability.physicalExposureScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Based on coastal/plain topology</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 block mb-1">Drainage Resilience</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {vulnerability.drainageResilienceScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Capacity against 7d rainfall pulses</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 block mb-1">Social Vulnerability</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {vulnerability.socialVulnerabilityScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Informal settlement exposure</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 block mb-1">Adaptive Capacity</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {vulnerability.adaptiveCapacityScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Municipal disaster readiness</p>
        </div>
      </div>

      {/* Role-Based Operational Advisory Panel (GET /api/recommendations) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Role-Tailored Operational Directives
              </h3>
              <ProvenanceBadge source="Demo / Simulated" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              GET /api/recommendations?location={activeLocId}&amp;role={activeRole}
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {(
              [
                { id: 'resident', label: 'Resident', icon: Users },
                { id: 'authority', label: 'Authority', icon: Building2 },
                { id: 'farmer', label: 'Farmer', icon: Tractor },
                { id: 'hospital', label: 'Hospital', icon: HeartPulse },
              ] as const
            ).map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  onClick={() => setActiveRole(r.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeRole === r.id
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {roleRecs && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200 dark:border-slate-700">
              <span>Primary Context: <strong className="text-slate-800 dark:text-slate-200">{roleRecs.hazard}</strong></span>
              <span>Assessed Risk Level: <strong className="text-rose-600 dark:text-rose-400">{roleRecs.riskLevel}</strong></span>
            </div>
            <ul className="space-y-2 text-xs">
              {roleRecs.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Critical Assets at Risk */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Identified Assets &amp; Critical Infrastructure at Risk ({vulnerability.locationName})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {vulnerability.criticalAssetsAtRisk.map((asset, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-800 dark:text-slate-200">{asset}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Recommendations List */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Triggered Mitigation Protocols ({recommendations.length} Active Directives)
            </h3>
            <p className="text-xs text-slate-500">
              Each directive links directly to observed threshold conditions in the dataset
            </p>
          </div>
          <ProvenanceBadge source="Demo / Simulated" />
        </div>

        <div className="space-y-3">
          {recommendations.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    item.priority === 'Immediate'
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : item.priority === 'High'
                      ? 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                      : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {item.priority} Priority
                  </span>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
                  Trigger: {item.triggerThreshold}
                </div>
              </div>

              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                {item.action}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {item.rationale}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
