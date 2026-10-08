import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { useLanguage } from '../../context/LanguageContext';
import { User } from '../../types';
import { X, FileText, Check, Calendar, Stethoscope } from 'lucide-react';

interface Props {
  patient: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AddWorkerNoteModal: React.FC<Props> = ({ patient, isOpen, onClose }) => {
  const { addHealthcareNote } = useHealth();
  const { t } = useLanguage();

  const [note, setNote] = useState('');
  const [followUpRequired, setFollowUpRequired] = useState(true);
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [prescription, setPrescription] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen || !patient) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    addHealthcareNote(
      patient.id,
      note.trim(),
      followUpRequired,
      followUpRequired ? followUpDate : undefined,
      prescription.trim() || undefined
    );

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setNote('');
      setPrescription('');
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in text-slate-100">
      <div className="bg-slate-950/95 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-white/10">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 p-5 sm:p-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-teal-500/20 rounded-2xl border border-teal-500/30 text-teal-300">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">{t('worker_add_note_title')}</h2>
              <p className="text-xs text-slate-300 font-medium">{t('sos_patient_label')} {patient.name} ({patient.village})</p>
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
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {isSaved && (
            <div className="p-3.5 bg-emerald-500/20 text-emerald-200 rounded-2xl flex items-center gap-2 border border-emerald-500/40 font-bold text-xs">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{t('worker_note_saved_success')}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              {t('worker_note_text')} *
            </label>
            <textarea
              required
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('worker_note_placeholder')}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-900/90 border border-white/10 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-white placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              {t('worker_prescription_label')}
            </label>
            <input
              type="text"
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              placeholder={t('worker_prescription_placeholder')}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900/90 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-white placeholder:text-slate-600"
            />
          </div>

          <div className="p-4 bg-slate-900/80 rounded-2xl border border-white/10 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={followUpRequired}
                onChange={(e) => setFollowUpRequired(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 bg-slate-950 border-white/20"
              />
              <span className="text-xs font-bold text-white">{t('worker_followup_required')}</span>
            </label>

            {followUpRequired && (
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-300 font-medium">{t('worker_followup_date_label')}</span>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="px-2.5 py-1 text-xs font-bold bg-slate-950 border border-white/10 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-white"
                />
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-teal-600/25 transition-all flex items-center justify-center gap-2 border border-teal-400/30"
            >
              <FileText className="w-4 h-4" />
              <span>{t('worker_save_note')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
