import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNetwork } from '../../context/NetworkContext';
import {
  X,
  Heart,
  Droplet,
  Thermometer,
  Wind,
  Activity,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const HealthDataEntryModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addHealthReading } = useHealth();
  const { t } = useLanguage();
  const { isOnline } = useNetwork();

  const [heartRate, setHeartRate] = useState<number>(74);
  const [systolicBp, setSystolicBp] = useState<number>(120);
  const [diastolicBp, setDiastolicBp] = useState<number>(80);
  const [temperature, setTemperature] = useState<number>(36.8);
  const [spo2, setSpo2] = useState<number>(98);
  const [bloodSugar, setBloodSugar] = useState<number>(105);
  const [mealStatus, setMealStatus] = useState<'fasting' | 'post_prandial' | 'random'>('fasting');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await addHealthReading({
      heart_rate: Number(heartRate),
      systolic_bp: Number(systolicBp),
      diastolic_bp: Number(diastolicBp),
      temperature: Number(temperature),
      spo2: Number(spo2),
      blood_sugar: Number(bloodSugar),
      meal_status: mealStatus,
      notes: notes.trim() || undefined,
    });

    setIsSubmitting(false);
    setShowSuccessToast(true);

    setTimeout(() => {
      setShowSuccessToast(false);
      onClose();
    }, 900);
  };

  const warnings: string[] = [];
  if (spo2 < 92) warnings.push(t('risk_low_spo2') + ' (< 92%)');
  if (systolicBp >= 140 || diastolicBp >= 90) warnings.push(t('risk_elevated') + ' ' + t('vital_bp'));
  if (heartRate > 105 || heartRate < 50) warnings.push(t('vital_heart_rate') + ' ' + t('risk_elevated'));
  if (temperature >= 38.0) warnings.push(t('vital_temp') + ' ' + t('risk_elevated'));
  if (bloodSugar > 200) warnings.push(t('vital_sugar') + ' ' + t('risk_elevated'));

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-6 bg-black/85 backdrop-blur-md flex items-center justify-center animate-fade-in text-slate-100"
    >
      <div className="relative w-full max-w-xl bg-slate-950/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 flex flex-col my-auto max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-4 sm:p-6 relative flex items-center justify-between border-b border-white/10 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-2xl border border-emerald-400/30 text-emerald-300">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black text-white tracking-tight">{t('entry_title')}</h2>
              <p className="text-xs text-slate-300 font-medium">
                {isOnline ? t('network_status_online_hint') : t('network_status_offline_hint')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 p-4 sm:p-6 space-y-5 overflow-y-auto modal-scroll-area overscroll-contain focus:outline-none">
          {showSuccessToast && (
            <div className="p-4 bg-emerald-500/20 text-emerald-200 rounded-2xl flex items-center gap-3 border border-emerald-500/40 animate-bounce">
              <Check className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold">{t('entry_saved_success')}</span>
            </div>
          )}

          {/* Anomaly Real-time Feedback Banner */}
          {warnings.length > 0 && (
            <div className="p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-2xl text-xs text-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{t('entry_anomaly_check_title')}</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-amber-200 font-medium pl-1">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Heart Rate */}
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>{t('entry_hr_label')}</span>
                </label>
                <span className="text-sm font-black text-white">{heartRate} BPM</span>
              </div>
              <input
                type="range"
                min="40"
                max="160"
                value={heartRate}
                onChange={(e) => setHeartRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <p className="text-[11px] text-slate-400">{t('entry_hr_hint')}</p>
            </div>

            {/* 2. Oxygen Saturation (SpO2) */}
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-cyan-400" />
                  <span>{t('entry_spo2_label')}</span>
                </label>
                <span className={`text-sm font-black ${spo2 < 92 ? 'text-red-400' : 'text-white'}`}>{spo2}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="100"
                value={spo2}
                onChange={(e) => setSpo2(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <p className="text-[11px] text-slate-400">{t('entry_spo2_hint')}</p>
            </div>

            {/* 3. Blood Pressure Systolic & Diastolic */}
            <div className="sm:col-span-2 p-4 bg-slate-900/80 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Droplet className="w-4 h-4 text-red-400" />
                  <span>{t('vital_bp')} (mmHg)</span>
                </label>
                <span className="text-base font-black text-white">{systolicBp} / {diastolicBp} mmHg</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">{t('entry_sys_label')}</span>
                  <input
                    type="number"
                    min="60"
                    max="240"
                    value={systolicBp}
                    onChange={(e) => setSystolicBp(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-bold bg-slate-950 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">{t('entry_dia_label')}</span>
                  <input
                    type="number"
                    min="40"
                    max="140"
                    value={diastolicBp}
                    onChange={(e) => setDiastolicBp(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-bold bg-slate-950 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">{t('entry_bp_hint')}</p>
            </div>

            {/* 4. Temperature */}
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-amber-400" />
                  <span>{t('entry_temp_label')}</span>
                </label>
                <span className="text-sm font-black text-white">{temperature}°C ({(temperature * 1.8 + 32).toFixed(1)}°F)</span>
              </div>
              <input
                type="number"
                step="0.1"
                min="34.0"
                max="42.0"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-bold bg-slate-950 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white"
              />
              <p className="text-[11px] text-slate-400">{t('entry_temp_hint')}</p>
            </div>

            {/* 5. Blood Sugar */}
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span>{t('entry_sugar_label')}</span>
                </label>
                <span className="text-sm font-black text-white">{bloodSugar} mg/dL</span>
              </div>
              <input
                type="number"
                min="40"
                max="500"
                value={bloodSugar}
                onChange={(e) => setBloodSugar(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-bold bg-slate-950 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white"
              />
              <p className="text-[11px] text-slate-400">{t('entry_sugar_hint')}</p>
            </div>
          </div>

          {/* Test Timing Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              {t('entry_meal_status')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'fasting' as const, label: t('entry_fasting') },
                { id: 'post_prandial' as const, label: t('entry_post_prandial') },
                { id: 'random' as const, label: t('entry_random') },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMealStatus(m.id)}
                  className={`py-2.5 px-2 text-xs font-semibold rounded-xl border transition-all ${
                    mealStatus === m.id
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md font-bold'
                      : 'bg-slate-900/80 text-slate-400 border-white/10 hover:bg-slate-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes / Symptoms */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              {t('entry_notes')}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('entry_notes_placeholder')}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-900/90 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white placeholder:text-slate-600"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 border border-emerald-400/30"
            >
              <Sparkles className="w-5 h-5" />
              <span>{isSubmitting ? t('entry_processing') : t('entry_submit')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
