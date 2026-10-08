import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { useHealth } from '../../context/HealthContext';
import { useLanguage } from '../../context/LanguageContext';
import { analyzeHealthRisk } from '../../services/aiAnalysisService';
import { StatusBadge } from '../common/StatusBadge';
import { HealthScanReportModal } from '../patient/HealthScanReportModal';
import {
  X,
  Phone,
  Sparkles,
  Plus,
  SearchCheck,
} from 'lucide-react';

interface Props {
  patient: User | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAddNote: (patient: User) => void;
}

export const PatientDetailModal: React.FC<Props> = ({
  patient,
  isOpen,
  onClose,
  onOpenAddNote,
}) => {
  const { getUserReadings, getUserNotes } = useHealth();
  const { language, t } = useLanguage();
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !patient) return null;

  const readings = getUserReadings(patient.id);
  const notes = getUserNotes(patient.id);
  const latestReading = readings[0] || null;
  const riskAnalysis = analyzeHealthRisk(latestReading, readings.slice(1));

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-6 bg-black/85 backdrop-blur-md flex items-center justify-center animate-fade-in text-slate-100"
    >
      <div className="relative w-full max-w-3xl bg-slate-950/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 flex flex-col my-auto max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-slate-950 via-teal-950 to-slate-950 p-4 sm:p-6 flex items-start justify-between border-b border-white/10 z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-teal-300 flex items-center justify-center font-black text-lg shadow-lg shadow-teal-500/10">
              {patient.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black text-white">{patient.name}</h2>
                <StatusBadge status={riskAnalysis.health_status} size="sm" />
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {patient.age} {t('patient_years_old')} • {patient.gender === 'male' ? t('auth_gender_male') : patient.gender === 'female' ? t('auth_gender_female') : t('auth_gender_other')} • {t('patient_blood_group')}: {patient.blood_group || 'O+'} • {patient.village}, {patient.district}
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

        {/* Modal Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto modal-scroll-area p-4 sm:p-6 space-y-5 text-xs sm:text-sm overscroll-contain focus:outline-none">
          {/* Contact & Medical Background */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-900/80 rounded-2xl border border-white/10">
            <div className="space-y-1.5">
              <p className="text-slate-400">{t('auth_phone_label')}:</p>
              <a href={`tel:${patient.phone}`} className="font-bold text-teal-400 hover:underline flex items-center gap-1.5 text-sm">
                <Phone className="w-3.5 h-3.5" />
                <span>{patient.phone}</span>
              </a>
            </div>
            <div className="space-y-1.5">
              <p className="text-slate-400">{t('patient_emergency_contact_label')}</p>
              <p className="font-bold text-white">{patient.emergency_contact.name} ({patient.emergency_contact.phone})</p>
            </div>
            {patient.known_conditions && patient.known_conditions.length > 0 && (
              <div className="sm:col-span-2 pt-2 border-t border-white/10">
                <span className="text-slate-400 font-semibold mr-2">{t('patient_pre_existing_conditions')}</span>
                <span className="font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                  {patient.known_conditions.join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* AI Risk Assessment Card for ASHA */}
          <div className="p-4 rounded-2xl border border-teal-500/30 bg-teal-950/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span className="font-bold text-teal-300 uppercase tracking-wider text-xs">
                  {t('ai_analysis_title')}
                </span>
              </div>
              <StatusBadge risk={riskAnalysis.risk_level} size="sm" />
            </div>
            <p className="text-slate-200 font-medium text-xs leading-relaxed">
              "{riskAnalysis.summary[language] || riskAnalysis.summary.en}"
            </p>
            <div className="text-[11px] text-slate-300 bg-slate-950/80 p-2.5 rounded-xl border border-white/5">
              <strong className="text-white">{t('ai_baseline_comparison')}:</strong> {riskAnalysis.comparison_with_baseline[language] || riskAnalysis.comparison_with_baseline.en}
            </div>
          </div>

          {/* Latest Recorded Vitals Snapshot with Scan Report Button */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-extrabold text-white text-sm">{t('vital_latest_reading')}</h3>
              {latestReading && (
                <button
                  onClick={() => setIsScanModalOpen(true)}
                  className="px-3 py-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-bold text-xs rounded-xl border border-teal-500/30 flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <SearchCheck className="w-3.5 h-3.5" />
                  <span>{t('scan_report_btn')}</span>
                </button>
              )}
            </div>
            {latestReading ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('vital_heart_rate')}</span>
                  <span className="text-base font-black text-white">{latestReading.heart_rate}</span>
                  <span className="text-[10px] text-slate-400 block">BPM</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('vital_bp')}</span>
                  <span className="text-base font-black text-white">{latestReading.systolic_bp}/{latestReading.diastolic_bp}</span>
                  <span className="text-[10px] text-slate-400 block">mmHg</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('vital_spo2')}</span>
                  <span className={`text-base font-black ${latestReading.spo2 < 92 ? 'text-red-400' : 'text-white'}`}>{latestReading.spo2}%</span>
                  <span className="text-[10px] text-slate-400 block">{t('vital_target_label')} 95%+</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('vital_temp')}</span>
                  <span className="text-base font-black text-white">{latestReading.temperature}°C</span>
                  <span className="text-[10px] text-slate-400 block">{(latestReading.temperature * 1.8 + 32).toFixed(1)}°F</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('vital_sugar')}</span>
                  <span className="text-base font-black text-white">{latestReading.blood_sugar}</span>
                  <span className="text-[10px] text-slate-400 block">mg/dL</span>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 italic text-xs">{t('worker_no_readings_for_patient')}</p>
            )}
          </div>

          {/* Healthcare Worker Visit Notes Log */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-extrabold text-white text-sm">{t('worker_past_notes_title')} ({notes.length})</h3>
              <button
                onClick={() => {
                  onClose();
                  onOpenAddNote(patient);
                }}
                className="px-3 py-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('worker_add_note_title')}</span>
              </button>
            </div>

            {notes.length > 0 ? (
              <div className="space-y-2">
                {notes.map((n) => (
                  <div key={n.id} className="p-3.5 bg-slate-900/80 rounded-2xl border border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{n.healthcare_worker_name}</span>
                      <span className="text-[11px] text-slate-400">{new Date(n.created_at).toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'kn' ? 'kn-IN' : 'en-IN')}</span>
                    </div>
                    <p className="text-xs text-slate-300">{n.note}</p>
                    {n.prescription_advice && (
                      <p className="text-[11px] text-teal-300 font-semibold bg-teal-950/50 px-2 py-1 rounded-lg border border-teal-500/20">
                        {t('worker_prescription_label')}: {n.prescription_advice}
                      </p>
                    )}
                    {n.follow_up_required && (
                      <span className="inline-block text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                        {t('worker_followup_required')}: {n.follow_up_date ? new Date(n.follow_up_date).toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'kn' ? 'kn-IN' : 'en-IN') : 'Pending'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic text-xs">{t('worker_no_notes')}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 bg-slate-950 border-t border-white/10 flex items-center justify-end gap-2 z-10">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-300 bg-slate-900 border border-white/10 hover:bg-slate-800 rounded-xl"
          >
            {t('close')}
          </button>
        </div>
      </div>

      {/* Patient Health Scan Report Modal */}
      {latestReading && (
        <HealthScanReportModal
          isOpen={isScanModalOpen}
          onClose={() => setIsScanModalOpen(false)}
          patient={patient}
          reading={latestReading}
          riskAnalysis={riskAnalysis}
        />
      )}
    </div>
  );
};
