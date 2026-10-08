import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHealth } from '../../context/HealthContext';
import { useLanguage } from '../../context/LanguageContext';
import { User } from '../../types';
import { analyzeHealthRisk } from '../../services/aiAnalysisService';
import { EmergencyAlertsList } from './EmergencyAlertsList';
import { PatientDetailModal } from './PatientDetailModal';
import { AddWorkerNoteModal } from './AddWorkerNoteModal';
import { StatusBadge } from '../common/StatusBadge';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import {
  Users,
  AlertTriangle,
  ShieldAlert,
  CalendarCheck,
  Search,
  Eye,
  Phone,
  FileText,
  MapPin,
} from 'lucide-react';

export const WorkerDashboard: React.FC = () => {
  const { allUsers, currentUser } = useAuth();
  const { emergencyAlerts, healthcareNotes, getUserReadings } = useHealth();
  const { t, language } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'attention' | 'emergency'>('all');
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState<User | null>(null);
  const [selectedPatientForNote, setSelectedPatientForNote] = useState<User | null>(null);

  const patientUsers = allUsers.filter((u) => u.role === 'patient');

  const patientDataList = patientUsers.map((patient) => {
    const pReadings = getUserReadings(patient.id);
    const latest = pReadings[0] || null;
    const riskAnalysis = analyzeHealthRisk(latest, pReadings.slice(1));
    return {
      patient,
      latest,
      riskAnalysis,
    };
  });

  const totalPatients = patientUsers.length;
  const needingAttentionCount = patientDataList.filter(
    (p) => p.riskAnalysis.health_status === 'attention'
  ).length;
  const activeEmergenciesCount = emergencyAlerts.filter((a) => a.status !== 'resolved').length;
  const todayVisitsCount = healthcareNotes.filter((n) => {
    const isToday = new Date(n.created_at).toDateString() === new Date().toDateString();
    return isToday && n.follow_up_required;
  }).length + 2;

  const filteredPatients = patientDataList.filter(({ patient, riskAnalysis }) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery);

    if (!matchesSearch) return false;

    if (filterRisk === 'attention') {
      return riskAnalysis.health_status === 'attention';
    } else if (filterRisk === 'emergency') {
      return riskAnalysis.health_status === 'emergency';
    }
    return true;
  });

  return (
    <div className="space-y-10 sm:space-y-12 max-w-7xl mx-auto px-4 sm:px-8 py-8 animate-fade-in text-slate-100">
      
      {/* 1. Header Banner */}
      <div className="gamma-card bg-gradient-to-r from-teal-950/80 via-slate-900/90 to-emerald-950/80 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 border border-white/10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 uppercase tracking-wider">
              {t('worker_portal_badge')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{t('worker_dashboard_title')}</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {t('worker_logged_in_as')} <strong className="text-white">{currentUser.name}</strong> • {t('worker_subcenter_label')} {currentUser.village} ({currentUser.district})
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          <div className="bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center shadow-md">
            <span className="text-[10px] uppercase font-bold text-teal-300 block">{t('worker_primary_sector')}</span>
            <span className="text-sm font-extrabold text-white">{t('worker_cluster_name')}</span>
          </div>
        </div>
      </div>

      {/* 2. Mandatory Disclaimer */}
      <div>
        <DisclaimerBanner compact />
      </div>

      {/* 3. Summary Stat Cards with generous gap */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Patients */}
        <div className="gamma-card p-5 sm:p-6 rounded-3xl shadow-xl flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block uppercase">{t('worker_total_patients')}</span>
            <span className="text-2xl sm:text-3xl font-black text-white mt-0.5 block">{totalPatients}</span>
          </div>
        </div>

        {/* Needing Attention */}
        <div className="gamma-card-glow-amber bg-amber-950/25 p-5 sm:p-6 rounded-3xl shadow-xl flex items-center gap-4 border border-amber-500/30">
          <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-300 block uppercase">{t('worker_needing_attention')}</span>
            <span className="text-2xl sm:text-3xl font-black text-white mt-0.5 block">{needingAttentionCount}</span>
          </div>
        </div>

        {/* Active Emergencies */}
        <div className="gamma-card-glow-red bg-red-950/30 p-5 sm:p-6 rounded-3xl shadow-xl flex items-center gap-4 border border-red-500/30">
          <div className="p-3.5 rounded-2xl bg-red-500/20 text-red-300 border border-red-500/30 flex-shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold text-red-300 block uppercase">{t('worker_active_emergencies')}</span>
            <span className="text-2xl sm:text-3xl font-black text-white mt-0.5 block">{activeEmergenciesCount}</span>
          </div>
        </div>

        {/* Today's Visits */}
        <div className="gamma-card p-5 sm:p-6 rounded-3xl shadow-xl flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex-shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-300 block uppercase">{t('worker_today_visits')}</span>
            <span className="text-2xl sm:text-3xl font-black text-white mt-0.5 block">{todayVisitsCount}</span>
          </div>
        </div>
      </div>

      {/* 4. Emergency Dispatch Console */}
      <div>
        <EmergencyAlertsList />
      </div>

      {/* 5. Patient Health Roster Table / Cards */}
      <div className="gamma-card rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">{t('worker_patient_list')}</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{t('worker_patient_list_sub')}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('worker_search_placeholder')}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-900/90 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-white placeholder:text-slate-500"
              />
            </div>

            {/* Risk Filters */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-white/10 w-full sm:w-auto justify-center">
              <button
                onClick={() => setFilterRisk('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterRisk === 'all' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('worker_filter_all')}
              </button>
              <button
                onClick={() => setFilterRisk('attention')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterRisk === 'attention' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('worker_filter_attention')}
              </button>
              <button
                onClick={() => setFilterRisk('emergency')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterRisk === 'emergency' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('worker_filter_emergency')}
              </button>
            </div>
          </div>
        </div>

        {/* Patient Roster Grid Cards (Spacious separation) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPatients.map(({ patient, latest, riskAnalysis }) => (
            <div
              key={patient.id}
              className="p-5 sm:p-6 rounded-3xl border border-white/10 bg-slate-900/75 hover:border-teal-500/40 hover:shadow-2xl transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-teal-300 font-black flex items-center justify-center text-sm shadow-md flex-shrink-0">
                      {patient.name[0]}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-base leading-tight">
                        {patient.name}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {patient.village} • {patient.age} {t('patient_years_old')} {patient.gender === 'male' ? t('auth_gender_male')[0] : t('auth_gender_female')[0]}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={riskAnalysis.health_status} size="sm" />
                </div>

                {/* Latest Vitals Snapshot */}
                {latest ? (
                  <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-white/5 text-xs space-y-1.5 my-3">
                    <div className="flex items-center justify-between font-bold text-slate-200">
                      <span>BP: <strong className={latest.systolic_bp >= 140 ? 'text-amber-400' : 'text-white'}>{latest.systolic_bp}/{latest.diastolic_bp}</strong></span>
                      <span>SpO2: <strong className={latest.spo2 < 92 ? 'text-red-400' : 'text-white'}>{latest.spo2}%</strong></span>
                      <span>HR: <strong className="text-white">{latest.heart_rate}</strong></span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
                      <span>{t('vital_sugar')}: {latest.blood_sugar} mg/dL</span>
                      <span>{t('vital_temp')}: {latest.temperature}°C</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-950/80 rounded-2xl text-center text-xs text-slate-500 my-3">
                    {t('worker_no_readings_for_patient')}
                  </div>
                )}

                {/* AI Triage Snippet */}
                <p className="text-xs text-slate-300 line-clamp-2 italic leading-relaxed">
                  "{riskAnalysis.summary[language] || riskAnalysis.summary.en}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 pt-3.5 border-t border-white/5">
                <button
                  onClick={() => setSelectedPatientForDetail(patient)}
                  className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-white/5 shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5 text-teal-400" />
                  <span>{t('worker_action_view')}</span>
                </button>

                <button
                  onClick={() => setSelectedPatientForNote(patient)}
                  className="py-2.5 px-3.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-bold text-xs rounded-xl border border-teal-500/30 flex items-center gap-1.5 transition-colors shadow-sm"
                  title={t('worker_add_note_title')}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{t('worker_action_add_note')}</span>
                </button>

                <a
                  href={`tel:${patient.phone}`}
                  className="p-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl border border-emerald-500/30 transition-colors shadow-sm"
                  title={t('worker_call_patient')}
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <PatientDetailModal
        patient={selectedPatientForDetail}
        isOpen={!!selectedPatientForDetail}
        onClose={() => setSelectedPatientForDetail(null)}
        onOpenAddNote={(p) => setSelectedPatientForNote(p)}
      />

      <AddWorkerNoteModal
        patient={selectedPatientForNote}
        isOpen={!!selectedPatientForNote}
        onClose={() => setSelectedPatientForNote(null)}
      />
    </div>
  );
};
