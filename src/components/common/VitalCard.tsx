import React from 'react';
import { HealthStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  unit: string;
  icon: React.ReactNode;
  iconBgColor: string;
  referenceRange: string;
  status: HealthStatus;
  trend?: 'up' | 'down' | 'stable';
  trendLabel?: string;
  subtitle?: string;
  onClick?: () => void;
}

export const VitalCard: React.FC<Props> = ({
  title,
  value,
  unit,
  icon,
  iconBgColor,
  referenceRange,
  status,
  trend,
  trendLabel,
  subtitle,
  onClick,
}) => {
  const { t } = useLanguage();

  const getStatusStyle = () => {
    switch (status) {
      case 'emergency':
        return 'gamma-card-glow-red bg-red-950/30 ring-1 ring-red-500/50 hover:border-red-400/60';
      case 'attention':
        return 'gamma-card-glow-amber bg-amber-950/30 ring-1 ring-amber-500/50 hover:border-amber-400/60';
      default:
        return 'gamma-card hover:border-emerald-500/50';
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'emergency':
        return <span className="text-[11px] px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-bold animate-pulse">🔴 {t('status_critical')}</span>;
      case 'attention':
        return <span className="text-[11px] px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">🟡 {t('status_attention')}</span>;
      default:
        return <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">🟢 {t('status_normal')}</span>;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-5 sm:p-6 rounded-3xl transition-all duration-300 flex flex-col justify-between group shadow-xl ${getStatusStyle()} ${
        onClick ? 'cursor-pointer active:scale-[0.98]' : ''
      }`}
    >
      <div>
        {/* Header with clear spacing */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${iconBgColor} flex-shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
              {icon}
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base leading-tight tracking-tight">{title}</h3>
              {subtitle && <p className="text-[11px] text-slate-400 font-medium mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Value Display with generous vertical room */}
        <div className="flex items-baseline gap-2.5 my-3.5">
          <span className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-sm">{value}</span>
          <span className="text-xs sm:text-sm font-bold text-slate-400">{unit}</span>
        </div>
      </div>

      {/* Footer / Reference & Trend */}
      <div className="pt-3.5 mt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <span className="truncate pr-2">{t('vital_target_label')} <strong className="text-slate-200 font-semibold">{referenceRange}</strong></span>
        {trend && (
          <span className="flex items-center gap-1.5 font-bold flex-shrink-0">
            {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-amber-400" />}
            {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-cyan-400" />}
            {trend === 'stable' && <Minus className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="text-[11px] text-slate-300">{trendLabel}</span>
          </span>
        )}
      </div>
    </div>
  );
};
