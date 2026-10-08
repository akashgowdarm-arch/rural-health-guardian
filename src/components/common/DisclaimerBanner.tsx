import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  compact?: boolean;
}

export const DisclaimerBanner: React.FC<Props> = ({ compact = false }) => {
  const { t } = useLanguage();

  if (compact) {
    return (
      <div className="bg-amber-500/10 border-l-4 border-amber-500 px-3.5 py-2 text-xs text-amber-200 rounded-r-xl flex items-center gap-2 backdrop-blur-md">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <p className="font-semibold">{t('disclaimer_short')}</p>
      </div>
    );
  }

  return (
    <div className="gamma-card bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-white/10 rounded-2xl p-4 shadow-xl">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30 flex-shrink-0 mt-0.5 shadow-sm">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1 text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
          <span className="font-bold text-amber-300 mr-1.5">{t('official_health_notice')}:</span>
          {t('disclaimer')}
        </div>
      </div>
    </div>
  );
};
