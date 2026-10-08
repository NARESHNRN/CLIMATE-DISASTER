import React from 'react';
import { DataSourceProvenance } from '../data/types';
import { Database, Sparkles } from 'lucide-react';

interface ProvenanceBadgeProps {
  source: DataSourceProvenance;
  field?: string;
  className?: string;
  showIcon?: boolean;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  source,
  field,
  className = '',
  showIcon = true,
}) => {
  const isUploaded = source === 'Uploaded Dataset';

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium tracking-tight whitespace-nowrap transition-colors ${
        isUploaded
          ? 'text-emerald-700 dark:text-emerald-300'
          : 'text-indigo-600 dark:text-indigo-300'
      } ${className}`}
      title={
        isUploaded
          ? `Sourced directly from user uploaded dataset${field ? ` (column: ${field})` : ''}`
          : 'Demo / Simulated value (not directly present in uploaded dataset)'
      }
    >
      {showIcon && (
        isUploaded ? (
          <Database className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
        ) : (
          <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400 shrink-0" />
        )
      )}
      <span>{isUploaded ? 'Uploaded Dataset' : 'Demo / Simulated'}</span>
      {field && isUploaded && (
        <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
          [{field}]
        </span>
      )}
    </span>
  );
};
