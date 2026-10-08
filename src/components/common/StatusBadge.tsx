import React from 'react';
import { HealthStatus, RiskLevel } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { CheckCircle2, AlertCircle, AlertOctagon } from 'lucide-react';

interface Props {
  status?: HealthStatus;
  risk?: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<Props> = ({
  status,
  risk,
  size = 'md',
  showIcon = true,
}) => {
  const { t } = useLanguage();

  // Resolve status or risk
  let effectiveStatus: HealthStatus = status || 'normal';
  if (risk) {
    if (risk === 'High Risk') effectiveStatus = 'emergency';
    else if (risk === 'Medium Risk') effectiveStatus = 'attention';
    else effectiveStatus = 'normal';
  }

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5 font-semibold',
    lg: 'text-base px-4 py-2 gap-2 font-bold',
  };

  if (effectiveStatus === 'emergency') {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-red-100 text-red-700 border border-red-300 shadow-sm ${sizeClasses[size]}`}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
        </span>
        {showIcon && <AlertOctagon className="w-4 h-4 text-red-600" />}
        <span>{risk ? t('risk_high') : t('status_emergency')}</span>
      </span>
    );
  }

  if (effectiveStatus === 'attention') {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-amber-100 text-amber-800 border border-amber-300 shadow-sm ${sizeClasses[size]}`}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
        {showIcon && <AlertCircle className="w-4 h-4 text-amber-600" />}
        <span>{risk ? t('risk_medium') : t('status_attention')}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm ${sizeClasses[size]}`}
    >
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
      {showIcon && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
      <span>{risk ? t('risk_low') : t('status_normal')}</span>
    </span>
  );
};
