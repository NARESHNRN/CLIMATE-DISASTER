import React, { useState, useEffect } from 'react';
import { Api } from '../services/api';
import { LstmBackendResponse } from '../data/types';
import { ClimateRiskService } from '../services/climateRiskService';
import { ProvenanceBadge } from './ProvenanceBadge';
import {
  Cpu,
  Layers,
  ArrowRight,
  TrendingUp,
  Sliders,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  Info,
  RefreshCw,
} from 'lucide-react';

interface LstmVisualizerViewProps {
  selectedLocationId: string;
  onSelectLocation: (locId: string) => void;
  auditProvenance: boolean;
}

export const LstmVisualizerView: React.FC<LstmVisualizerViewProps> = ({
  selectedLocationId,
  onSelectLocation,
  auditProvenance,
}) => {
  const activeLocId = selectedLocationId === 'all' ? 'Chennai' : selectedLocationId;
  const [backendLstm, setBackendLstm] = useState<LstmBackendResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'sequence' | 'architecture' | 'weights'>('sequence');

  // Grounded conceptual data from service
  const lstmData = ClimateRiskService.getLstmForecast(activeLocId);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Api.getLstmForecast(activeLocId).then((res) => {
      if (isMounted) {
        setBackendLstm(res.data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeLocId]);

  return (
    <div className="space-y-6">
      {/* Mandatory Engineering Transparency Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-300 dark:border-amber-800 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              Conceptual Sequence-to-Sequence Representation
            </h2>
            <ProvenanceBadge source="Demo / Simulated" />
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300">
            {lstmData.architectureSummary.disclaimer}
          </p>
        </div>
      </div>

      {/* Main LSTM Conceptual Dashboard Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Recurrent Neural Sequence: {activeLocId} Station
              </h3>
              <ProvenanceBadge source="Uploaded Dataset" field="Historical Sequence (T-7 to T)" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Sliding historical input tensor X[t-6:t] → Recurrent Hidden States → Lead Time Multi-Step Output Y[t+1:t+7]
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('sequence')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeTab === 'sequence'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Time Sequence
            </button>
            <button
              onClick={() => setActiveTab('weights')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeTab === 'weights'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Feature Attributions
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeTab === 'architecture'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Network Topology
            </button>
          </div>
        </div>

        {/* Tab 1: Historical Sequence -> Prospective Horizon */}
        {activeTab === 'sequence' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left: Historical Sliding Window (T-7 to T) */}
              <div className="lg:col-span-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    Input Tensor X[t-6:t] (Lookback)
                  </div>
                  <ProvenanceBadge source="Uploaded Dataset" field="7 Daily Observations" />
                </div>

                <div className="space-y-2 text-xs">
                  {lstmData.historicalSequence.map((step, idx) => (
                    <div
                      key={step.date}
                      className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-slate-400 w-6">T-{6 - idx}</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{step.date}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[11px]">
                        <span className="text-blue-600">{step.rainfall1d.toFixed(1)} mm</span>
                        <span className="text-slate-500">{(step.soilMoisture * 100).toFixed(0)}% soil</span>
                        <span className="text-slate-700 dark:text-slate-300">{step.temperatureMax.toFixed(1)}°C</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Center: Conceptual Bidirectional LSTM Cell Junction */}
              <div className="lg:col-span-2 flex flex-col items-center justify-center p-4 text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                  <Cpu className="w-7 h-7" />
                </div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Bi-LSTM Layer
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  128 Hidden Cells
                </div>
                <div className="w-full flex items-center justify-center text-slate-400 my-1">
                  <ArrowRight className="w-5 h-5 hidden lg:block" />
                </div>
                <span className="text-[10px] text-slate-400 italic">
                  Gated Recurrence Unit
                </span>
              </div>

              {/* Right: Output Prediction Horizon (T+1 to T+7) */}
              <div className="lg:col-span-5 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-950 dark:text-indigo-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    Projected Output Y[t+1:t+7]
                  </div>
                  <ProvenanceBadge source="Demo / Simulated" />
                </div>

                <div className="space-y-2 text-xs">
                  {lstmData.forecastSequence.map((step) => (
                    <div
                      key={step.date}
                      className="p-2 rounded bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-indigo-500 w-6">T+{step.step}</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{step.date}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[11px]">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {step.predictedRainfall.toFixed(1)} mm
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          [{step.confidenceLower.toFixed(0)}-{step.confidenceUpper.toFixed(0)}]
                        </span>
                        <span className={`font-semibold ${
                          step.floodProbability > 70
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {step.floodProbability}% flood
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Historical Sequence vs. Projected Step Overlay Chart */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-3">
                <span className="font-semibold text-slate-900 dark:text-white">
                  14-Day Continuity Trajectory (7-Day Historical Observed + 7-Day Predicted Lead Times)
                </span>
                <span className="font-mono text-[11px]">
                  Observed vs Synthetic Lead-Time Continuity
                </span>
              </div>

              {/* Simple illustrative SVG trend */}
              <div className="h-32 w-full flex items-end gap-2 pt-4">
                {lstmData.historicalSequence.map((p, i) => (
                  <div key={`hist-${i}`} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[10px] font-mono text-slate-500 group-hover:text-blue-600">
                      {p.rainfall1d.toFixed(0)}
                    </span>
                    <div
                      className="w-full bg-blue-600 rounded-t transition-all hover:bg-blue-500"
                      style={{ height: `${Math.min(100, Math.max(8, p.rainfall1d * 1.5))}px` }}
                    />
                    <span className="text-[9px] font-mono text-slate-400">T-{6 - i}</span>
                  </div>
                ))}
                <div className="w-[1px] h-full bg-slate-300 dark:bg-slate-700 mx-1 border-dashed" />
                {lstmData.forecastSequence.map((p, i) => (
                  <div key={`pred-${i}`} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[10px] font-mono text-indigo-500 group-hover:text-indigo-400 font-semibold">
                      {p.predictedRainfall.toFixed(0)}
                    </span>
                    <div
                      className="w-full bg-indigo-500/80 rounded-t border-t-2 border-indigo-400 border-dashed"
                      style={{ height: `${Math.min(100, Math.max(8, p.predictedRainfall * 1.5))}px` }}
                    />
                    <span className="text-[9px] font-mono text-indigo-400 font-medium">T+{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Feature Attributions & Gated Memory Weights */}
        {activeTab === 'weights' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Recurrent Attention Attribution Ranking</span>
              <ProvenanceBadge source="Demo / Simulated" />
            </div>

            <div className="space-y-3">
              {lstmData.featureAttributions.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white">
                    <span>{item.feature}</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      {(item.weight * 100).toFixed(0)}% Weight
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${item.weight * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">{item.importance}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Conceptual Network Architecture Specifications */}
        {activeTab === 'architecture' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-semibold text-slate-900 dark:text-white">
                Conceptual Architecture Specification
              </h4>
              <p className="text-slate-600 dark:text-slate-300">
                In a full-stack deployment, this pipeline ingests the 14-channel daily sequence from the uploaded dataset, performs batch normalization, applies a 2-layer Bidirectional LSTM with hidden state dimensionality $H=128$, and projects multi-hazard risk logits.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Input Channels</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">14 Features</span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Hidden Cells</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">128 Units</span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Recurrent Dropout</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">0.20</span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Loss Objective</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">BCE + MSE</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
