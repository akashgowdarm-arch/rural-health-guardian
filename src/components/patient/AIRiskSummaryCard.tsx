import React, { useState } from 'react';
import { AIRiskAnalysisResult } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { SpeechService } from '../../services/speechService';
import { StatusBadge } from '../common/StatusBadge';
import { Sparkles, Volume2, VolumeX, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';

interface Props {
  riskAnalysis: AIRiskAnalysisResult;
  onOpenSOS?: () => void;
}

export const AIRiskSummaryCard: React.FC<Props> = ({ riskAnalysis, onOpenSOS }) => {
  const { language, t } = useLanguage();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const currentSummary = riskAnalysis.summary[language] || riskAnalysis.summary.en;
  const recommendations = riskAnalysis.recommendations[language] || riskAnalysis.recommendations.en;
  const criticalFindings = riskAnalysis.critical_findings[language] || riskAnalysis.critical_findings.en;
  const baselineComparison = riskAnalysis.comparison_with_baseline[language] || riskAnalysis.comparison_with_baseline.en;

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      SpeechService.stop();
      setIsPlayingAudio(false);
    } else {
      const fullSpeech = `${t('ai_analysis_title')}. ${currentSummary}. ${recommendations.join('. ')}`;
      SpeechService.speak(fullSpeech, language);
      setIsPlayingAudio(true);

      setTimeout(() => {
        setIsPlayingAudio(false);
      }, 12000);
    }
  };

  const getCardTheme = () => {
    switch (riskAnalysis.risk_level) {
      case 'High Risk':
        return 'gamma-card-glow-red bg-gradient-to-br from-red-950/40 via-slate-900/80 to-rose-950/30 ring-1 ring-red-500/30';
      case 'Medium Risk':
        return 'gamma-card-glow-amber bg-gradient-to-br from-amber-950/35 via-slate-900/80 to-yellow-950/25 ring-1 ring-amber-500/30';
      default:
        return 'gamma-card-glow-emerald bg-gradient-to-br from-emerald-950/35 via-slate-900/80 to-teal-950/25 ring-1 ring-emerald-500/30';
    }
  };

  return (
    <div className={`p-6 sm:p-8 rounded-3xl transition-all duration-300 relative overflow-hidden shadow-2xl space-y-6 ${getCardTheme()}`}>
      {/* Header with clear separation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-5 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-400/30 shadow-lg shadow-emerald-500/10 flex-shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-black text-white text-lg sm:text-xl tracking-tight">
                {t('ai_analysis_title')}
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                {t('ai_triage_badge')}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5">
              {t('ai_baseline_comparison')}: <span className="font-bold text-white ml-1">{baselineComparison}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <StatusBadge risk={riskAnalysis.risk_level} size="md" />

          {/* Voice Guidance Readout Button */}
          <button
            onClick={handleToggleAudio}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 shadow-md ${
              isPlayingAudio
                ? 'bg-white text-slate-950 border-white animate-pulse'
                : 'bg-slate-900/90 text-slate-200 border-white/15 hover:bg-slate-800 hover:text-white'
            }`}
            title={t('ai_speak_advice')}
          >
            {isPlayingAudio ? <VolumeX className="w-4 h-4 text-slate-900" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isPlayingAudio ? t('ai_stop_advice') : t('ai_speak_advice')}</span>
          </button>
        </div>
      </div>

      {/* Main AI Summary Box */}
      <div className="bg-slate-900/75 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
        <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
          "{currentSummary}"
        </p>

        {criticalFindings.length > 0 && (
          <div className="pt-4 border-t border-white/10 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t('ai_critical_findings')}:
            </h4>
            <ul className="space-y-2 pl-1">
              {criticalFindings.map((f, i) => (
                <li key={i} className="text-xs sm:text-sm text-slate-200 flex items-start gap-2.5 font-medium">
                  <span className="text-amber-400 font-black text-base leading-none mt-0.5">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Actionable Recommendations with clean card separation */}
      <div className="space-y-3.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{t('ai_recommendations')}:</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-900/70 hover:bg-slate-900/90 rounded-2xl border border-white/10 text-xs sm:text-sm text-slate-200 leading-snug flex items-start gap-3 shadow-md transition-colors"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="font-medium pt-0.5">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* High Risk Emergency Call to Action Banner */}
      {riskAnalysis.risk_level === 'High Risk' && onOpenSOS && (
        <div className="p-5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xl shadow-red-600/40 animate-pulse border border-red-400/40">
          <div className="flex items-center gap-3.5">
            <ShieldAlert className="w-8 h-8 flex-shrink-0" />
            <div>
              <p className="font-black text-sm sm:text-base">{t('ai_critical_detected_title')}</p>
              <p className="text-xs text-red-100 font-medium mt-0.5">{t('ai_critical_detected_sub')}</p>
            </div>
          </div>
          <button
            onClick={onOpenSOS}
            className="px-5 py-3 bg-white text-red-700 font-black text-xs sm:text-sm rounded-xl shadow-lg hover:bg-red-50 active:scale-95 transition-all flex items-center justify-center gap-1.5 self-start sm:self-center whitespace-nowrap"
          >
            <span>{t('ai_activate_sos_btn')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
