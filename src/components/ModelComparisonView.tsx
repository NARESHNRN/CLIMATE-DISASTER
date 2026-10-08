import React, { useState, useEffect } from 'react';
import { Api } from '../services/api';
import { ModelComparisonResponse } from '../data/types';
import { ProvenanceBadge } from './ProvenanceBadge';
import {
  Cpu,
  BarChart3,
  Award,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';

interface ModelComparisonViewProps {
  auditProvenance: boolean;
}

export const ModelComparisonView: React.FC<ModelComparisonViewProps> = ({ auditProvenance }) => {
  const [modelData, setModelData] = useState<ModelComparisonResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Api.getModelComparison().then((res) => {
      if (isMounted) {
        setModelData(res.data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Strict Engineering Notice: DEMO METRICS */}
      <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-300 dark:border-amber-800 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
              DEMO METRICS — Benchmarking Evaluation
            </h2>
            <ProvenanceBadge source="Demo / Simulated" />
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300">
            {modelData?.disclaimer || 'DEMO METRICS — Benchmarking estimates evaluated on simulated validation split. No live PyTorch/TensorFlow training claimed.'}
          </p>
        </div>
      </div>

      {/* Benchmark Matrix Table */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Multi-Hazard Model Architecture Comparison
            </h3>
            <p className="text-xs text-slate-500">
              Comparative benchmark evaluating sequence models vs tabular tree ensembles on multi-day hazard detection
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">GET /api/model-comparison</span>
            <ProvenanceBadge source="Demo / Simulated" />
          </div>
        </div>

        {loading ? (
          <div className="py-8 flex items-center justify-center gap-2 text-xs text-slate-500">
            <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
            <span>Loading model comparison metrics...</span>
          </div>
        ) : modelData ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Model Architecture</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                  <th className="py-2.5 px-3">F1-Score</th>
                  <th className="py-2.5 px-3">Precision</th>
                  <th className="py-2.5 px-3">Recall</th>
                  <th className="py-2.5 px-3">Inference Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {modelData.models.map((model, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {model.name}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {model.architecture}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-white">
                      {(model.accuracy * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      {(model.f1 * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                      {(model.precision * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                      {(model.recall * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                      {model.inferenceLatencyMs.toFixed(1)} ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {/* Comparison Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
            <Zap className="w-4 h-4 text-amber-500" /> Tabular Speed vs. Recurrent Memory
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            XGBoost provides near-instantaneous tabular scoring (2.1ms) with sharp feature splits on rainfall thresholds, while Bi-LSTM excels at capturing continuous antecedent hydro-saturation (7-day sequences) essential for river crest lead times.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
            <Award className="w-4 h-4 text-indigo-500" /> Stacking Meta-Learner Advantage
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Ensembling LSTM sequence features with tree-based static indices delivers the highest overall AUC-ROC (0.978) in simulations, balancing sudden cloudburst alerts with long-duration drought trends.
          </p>
        </div>
      </div>
    </div>
  );
};
