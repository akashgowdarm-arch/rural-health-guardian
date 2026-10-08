import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHealth } from '../../context/HealthContext';
import { useLanguage } from '../../context/LanguageContext';
import { SpeechService } from '../../services/speechService';
import { VitalCard } from '../common/VitalCard';
import { StatusBadge } from '../common/StatusBadge';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { AIRiskSummaryCard } from './AIRiskSummaryCard';
import { HealthScanReportModal } from './HealthScanReportModal';
import { NearestHelpCard } from '../location/NearestHelpCard';
import {
  Heart,
  Droplet,
  Thermometer,
  Wind,
  Activity,
  PlusCircle,
  ShieldAlert,
  Volume2,
  Calendar,
  MapPin,
  Phone,
  Clock,
  ChevronRight,
  Sparkles,
  FileText,
} from 'lucide-react';

interface Props {
  onOpenNewReading: () => void;
  onOpenSOS: () => void;
  onNavigateHistory: () => void;
  onNavigateAssistant: () => void;
}

export const PatientDashboard: React.FC<Props> = ({
  onOpenNewReading,
  onOpenSOS,
  onNavigateHistory,
  onNavigateAssistant,
}) => {
  const { currentUser } = useAuth();
  const { latestReading, currentRiskAnalysis, patientReadings } = useHealth();
  const { language, t } = useLanguage();

  const [isScanReportOpen, setIsScanReportOpen] = useState(false);

  const getVitalStatus = (type: string, val: number, val2?: number) => {
    switch (type) {
      case 'spo2':
        if (val < 90) return 'emergency';
        if (val <= 94) return 'attention';
        return 'normal';
      case 'bp':
        if (val >= 160 || (val2 && val2 >= 100)) return 'emergency';
        if (val >= 135 || (val2 && val2 >= 88)) return 'attention';
        return 'normal';
      case 'hr':
        if (val > 115 || val < 50) return 'attention';
        return 'normal';
      case 'temp':
        if (val >= 38.5) return 'emergency';
        if (val >= 37.6) return 'attention';
        return 'normal';
      case 'sugar':
        if (val > 220 || val < 65) return 'emergency';
        if (val > 150) return 'attention';
        return 'normal';
      default:
        return 'normal';
    }
  };

  const handleVoiceSummary = () => {
    if (!latestReading) return;
    const msg = `${t('sos_patient_label')} ${currentUser.name}. ${t('vital_overall')}: ${currentRiskAnalysis.health_status}. ${t('vital_heart_rate')}: ${latestReading.heart_rate} BPM. ${t('vital_bp')}: ${latestReading.systolic_bp}/${latestReading.diastolic_bp}. ${t('vital_spo2')}: ${latestReading.spo2}%. ${t('vital_temp')}: ${latestReading.temperature}°C. ${currentRiskAnalysis.summary[language] || currentRiskAnalysis.summary.en}`;
    SpeechService.speak(msg, language);
  };

  return (
    <div className="space-y-10 sm:space-y-12 max-w-7xl mx-auto px-4 sm:px-8 py-8 animate-fade-in text-slate-100">
      
      {/* 1. Patient Profile Header Section */}
      <div className="gamma-card bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-teal-950/60 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-8 translate-y-8">
          <Heart className="w-64 h-64 fill-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{currentUser.name}</h1>
              <span className="text-xs px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                {currentUser.age} {t('patient_years_old')} • {currentUser.gender === 'male' ? t('auth_gender_male') : currentUser.gender === 'female' ? t('auth_gender_female') : t('auth_gender_other')} • {t('patient_blood_group')}: {currentUser.blood_group || 'O+'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs sm:text-sm text-slate-300">
              <span className="flex items-center gap-2 font-medium">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {currentUser.village}, {currentUser.district}, {currentUser.state}
              </span>
              <span className="flex items-center gap-2 font-medium">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {t('patient_emergency_contact_label')} <strong className="text-white ml-1">{currentUser.emergency_contact.phone} ({currentUser.emergency_contact.name})</strong>
              </span>
            </div>
          </div>

          {/* Overall Health Status Badge & Audio Action */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2 md:pt-0">
            <div className="bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-3.5 shadow-md">
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
                  {t('vital_overall')}
                </p>
                <StatusBadge status={currentRiskAnalysis.health_status} size="md" />
              </div>
            </div>

            <button
              onClick={handleVoiceSummary}
              className="p-3.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-2xl backdrop-blur-md border border-white/10 transition-all shadow-md hover:scale-105 active:scale-95"
              title={t('vital_voice_readout')}
            >
              <Volume2 className="w-5 h-5 text-emerald-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Mandatory Regulatory Health Disclaimer */}
      <div>
        <DisclaimerBanner />
      </div>

      {/* 3. Quick Action Buttons Grid (Spacious separation) */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* 1. Enter New Reading */}
          <button
            onClick={onOpenNewReading}
            className="p-5 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold shadow-xl shadow-emerald-600/25 active:scale-[0.98] transition-all flex items-center justify-between group text-left border border-emerald-400/30"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-white/20 text-white shadow-md flex-shrink-0">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-base font-black leading-tight">{t('vital_enter_new')}</p>
                <p className="text-xs text-emerald-100 font-medium mt-0.5">{t('vital_enter_new_sub')}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-emerald-200 group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </button>

          {/* 2. View Official Diagnostic Health Report */}
          <button
            onClick={() => setIsScanReportOpen(true)}
            disabled={!latestReading}
            className="p-5 rounded-3xl bg-gradient-to-r from-indigo-700 via-teal-700 to-slate-900 hover:from-indigo-600 hover:to-slate-800 text-white font-extrabold shadow-xl shadow-indigo-700/25 active:scale-[0.98] transition-all flex items-center justify-between group text-left disabled:opacity-60 border border-indigo-400/30"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-white/20 text-indigo-200 shadow-md flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-base font-black leading-tight">
                  {t('scan_report_btn')}
                </p>
                <p className="text-xs text-indigo-200 font-medium mt-0.5">1-2 Page Official Sheet</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-indigo-200 group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </button>

          {/* 3. SOS Emergency Button */}
          <button
            onClick={onOpenSOS}
            className="p-5 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold shadow-xl shadow-red-600/35 active:scale-[0.98] transition-all flex items-center justify-between group text-left relative overflow-hidden border border-red-400/40"
          >
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="p-3 rounded-2xl bg-white/20 text-white animate-bounce shadow-md flex-shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <p className="text-base font-black leading-tight">{t('sos_button')}</p>
                <p className="text-xs text-red-100 font-medium mt-0.5">{t('sos_subtext')}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-red-200 group-hover:translate-x-1 transition-transform relative z-10 flex-shrink-0" />
          </button>

          {/* 4. AI Assistant Trigger */}
          <button
            onClick={onNavigateAssistant}
            className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-slate-800 hover:to-indigo-900 text-white font-extrabold shadow-xl shadow-slate-900/30 active:scale-[0.98] transition-all flex items-center justify-between group text-left border border-white/10"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 shadow-md border border-emerald-500/30 flex-shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-base font-black leading-tight">{t('chat_title')}</p>
                <p className="text-xs text-slate-300 font-medium mt-0.5">{t('chat_ask_phc_hours_sub')}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* 4. AI Health Risk Analysis Summary */}
      <div>
        <AIRiskSummaryCard
          riskAnalysis={currentRiskAnalysis}
          onOpenSOS={onOpenSOS}
        />
      </div>

      {/* 5. Nearest Medical Assistance & Emergency PHC Locator */}
      <div>
        <NearestHelpCard />
      </div>

      {/* 5. Core Vitals Section (Spacious Header + Grid) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-white tracking-tight">
              {t('vital_latest_reading')}
            </h2>
            {latestReading && (
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 bg-slate-900/80 px-3 py-1 rounded-full border border-white/10">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {new Date(latestReading.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <button
            onClick={onNavigateHistory}
            className="text-xs sm:text-sm font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 self-start sm:self-center"
          >
            <span>{t('vital_view_trends_btn')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {latestReading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
            {/* 1. Heart Rate */}
            <VitalCard
              title={t('vital_heart_rate')}
              value={latestReading.heart_rate}
              unit="BPM"
              icon={<Heart className="w-5 h-5 text-rose-400" />}
              iconBgColor="bg-rose-500/20 border border-rose-500/30"
              referenceRange="60 - 100 BPM"
              status={getVitalStatus('hr', latestReading.heart_rate)}
              trend="stable"
              trendLabel={t('risk_normal_rhythm')}
              onClick={onNavigateHistory}
            />

            {/* 2. Blood Pressure */}
            <VitalCard
              title={t('vital_bp')}
              value={`${latestReading.systolic_bp}/${latestReading.diastolic_bp}`}
              unit="mmHg"
              icon={<Droplet className="w-5 h-5 text-red-400" />}
              iconBgColor="bg-red-500/20 border border-red-500/30"
              referenceRange="90/60 - 120/80"
              status={getVitalStatus('bp', latestReading.systolic_bp, latestReading.diastolic_bp)}
              trend={latestReading.systolic_bp > 135 ? 'up' : 'stable'}
              trendLabel={latestReading.systolic_bp > 135 ? t('risk_elevated') : t('risk_optimal')}
              onClick={onNavigateHistory}
            />

            {/* 3. Body Temperature */}
            <VitalCard
              title={t('vital_temp')}
              value={latestReading.temperature}
              unit="°C"
              icon={<Thermometer className="w-5 h-5 text-amber-400" />}
              iconBgColor="bg-amber-500/20 border border-amber-500/30"
              referenceRange="36.5°C - 37.5°C"
              status={getVitalStatus('temp', latestReading.temperature)}
              subtitle={`(${(latestReading.temperature * 1.8 + 32).toFixed(1)}°F)`}
              trend="stable"
              onClick={onNavigateHistory}
            />

            {/* 4. Oxygen SpO2 */}
            <VitalCard
              title={t('vital_spo2')}
              value={latestReading.spo2}
              unit="%"
              icon={<Wind className="w-5 h-5 text-cyan-400" />}
              iconBgColor="bg-cyan-500/20 border border-cyan-500/30"
              referenceRange="95% - 100%"
              status={getVitalStatus('spo2', latestReading.spo2)}
              trend={latestReading.spo2 < 92 ? 'down' : 'stable'}
              trendLabel={latestReading.spo2 < 92 ? t('risk_low_spo2') : t('risk_adequate')}
              onClick={onNavigateHistory}
            />

            {/* 5. Blood Sugar */}
            <VitalCard
              title={t('vital_sugar')}
              value={latestReading.blood_sugar}
              unit="mg/dL"
              icon={<Activity className="w-5 h-5 text-purple-400" />}
              iconBgColor="bg-purple-500/20 border border-purple-500/30"
              referenceRange="70 - 140 mg/dL"
              status={getVitalStatus('sugar', latestReading.blood_sugar)}
              subtitle={latestReading.meal_status ? `(${latestReading.meal_status === 'fasting' ? t('entry_fasting') : latestReading.meal_status === 'post_prandial' ? t('entry_post_prandial') : t('entry_random')})` : undefined}
              trend="stable"
              onClick={onNavigateHistory}
            />
          </div>
        ) : (
          <div className="p-10 text-center gamma-card rounded-3xl border border-white/10 shadow-xl space-y-4">
            <Activity className="w-14 h-14 text-slate-500 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-white">{t('vital_no_readings_title')}</h3>
              <p className="text-xs text-slate-400 mt-1">{t('vital_no_readings_sub')}</p>
            </div>
            <button
              onClick={onOpenNewReading}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md"
            >
              {t('vital_enter_new')}
            </button>
          </div>
        )}
      </div>

      {/* 6. Recent Reading History Timeline (Clear container margin & padding) */}
      {patientReadings.length > 0 && (
        <div className="gamma-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="font-black text-white text-base sm:text-lg">{t('recent_readings_history')}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Chronological timeline of logged vitals</p>
            </div>
            <button
              onClick={onNavigateHistory}
              className="text-xs sm:text-sm font-bold text-emerald-400 hover:underline"
            >
              {t('view_all')} ({patientReadings.length})
            </button>
          </div>

          <div className="divide-y divide-white/10 space-y-1">
            {patientReadings.slice(0, 4).map((r) => (
              <div key={r.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/5 px-3 rounded-2xl transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-slate-900 text-slate-400 flex-shrink-0 border border-white/5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-100">
                      {new Date(r.recorded_at).toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'kn' ? 'kn-IN' : 'en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} {t('at_time')} {new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {r.notes && <p className="text-[11px] text-slate-400 italic mt-0.5">"{r.notes}"</p>}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold text-slate-300">
                  <span className="px-3 py-1.5 bg-slate-900/90 rounded-xl border border-white/10">
                    HR: <strong className="text-white ml-1">{r.heart_rate}</strong> BPM
                  </span>
                  <span className="px-3 py-1.5 bg-slate-900/90 rounded-xl border border-white/10">
                    BP: <strong className="text-white ml-1">{r.systolic_bp}/{r.diastolic_bp}</strong>
                  </span>
                  <span className="px-3 py-1.5 bg-slate-900/90 rounded-xl border border-white/10">
                    SpO2: <strong className="text-white ml-1">{r.spo2}%</strong>
                  </span>
                  <span className="px-3 py-1.5 bg-slate-900/90 rounded-xl border border-white/10">
                    Temp: <strong className="text-white ml-1">{r.temperature}°C</strong>
                  </span>
                  <span className="px-3 py-1.5 bg-slate-900/90 rounded-xl border border-white/10">
                    Sugar: <strong className="text-white ml-1">{r.blood_sugar}</strong>
                  </span>
                  {r.is_synced ? (
                    <span className="text-[10px] text-emerald-400 font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">{t('synced_badge')}</span>
                  ) : (
                    <span className="text-[10px] text-amber-400 font-bold px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">{t('local_cached_badge')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Official 1-Page Health Diagnostic Report Certificate Modal */}
      <HealthScanReportModal
        isOpen={isScanReportOpen}
        onClose={() => setIsScanReportOpen(false)}
        patient={currentUser}
        reading={latestReading}
        riskAnalysis={currentRiskAnalysis}
      />
    </div>
  );
};
