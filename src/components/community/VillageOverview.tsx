import React from 'react';
import { useHealth } from '../../context/HealthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Users,
  AlertTriangle,
  ShieldAlert,
  Hospital,
  MapPin,
  Stethoscope,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { DisclaimerBanner } from '../common/DisclaimerBanner';

export const VillageOverview: React.FC = () => {
  const { villageStats } = useHealth();
  const { t } = useLanguage();

  const totalCitizens = villageStats.reduce((acc, v) => acc + v.total_citizens, 0);
  const totalActivePatients = villageStats.reduce((acc, v) => acc + v.active_patients, 0);
  const totalNeedingAttention = villageStats.reduce((acc, v) => acc + v.needing_attention, 0);
  const totalEmergencies = villageStats.reduce((acc, v) => acc + v.active_emergencies, 0);

  const barChartData = villageStats.map((v) => ({
    name: v.village.split(' ')[0],
    fullName: v.village,
    activePatients: v.active_patients,
    needingAttention: v.needing_attention,
    emergencies: v.active_emergencies,
  }));

  return (
    <div className="space-y-10 sm:space-y-12 max-w-7xl mx-auto px-4 sm:px-8 py-8 animate-fade-in text-slate-100">
      
      {/* 1. Header Banner */}
      <div className="gamma-card bg-gradient-to-r from-slate-900/90 via-indigo-950/80 to-slate-900/90 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 border border-white/10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase tracking-wider">
              {t('village_command_badge')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{t('village_overview_title')}</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {t('village_overview_sub')}
          </p>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center shadow-md self-start md:self-center">
          <span className="text-[10px] uppercase font-bold text-indigo-300 block">{t('village_coverage_badge')}</span>
          <span className="text-sm font-extrabold text-white">{t('village_clusters_label')}</span>
        </div>
      </div>

      {/* 2. Mandatory Disclaimer */}
      <div>
        <DisclaimerBanner compact />
      </div>

      {/* 3. Four Core Aggregated Metrics (Spacious gap) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="gamma-card p-5 sm:p-6 rounded-3xl shadow-xl flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block uppercase">{t('village_total_citizens')}</span>
            <span className="text-2xl sm:text-3xl font-black text-white mt-0.5 block">{totalCitizens.toLocaleString()}</span>
          </div>
        </div>

        <div className="gamma-card p-5 sm:p-6 rounded-3xl shadow-xl flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex-shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block uppercase">{t('village_active_monitored')}</span>
            <span className="text-2xl sm:text-3xl font-black text-teal-400 mt-0.5 block">{totalActivePatients}</span>
          </div>
        </div>

        <div className="gamma-card-glow-amber bg-amber-950/25 p-5 sm:p-6 rounded-3xl shadow-xl flex items-center gap-4 border border-amber-500/30">
          <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-300 block uppercase">{t('worker_needing_attention')}</span>
            <span className="text-2xl sm:text-3xl font-black text-white mt-0.5 block">{totalNeedingAttention}</span>
          </div>
        </div>

        <div className="gamma-card-glow-red bg-red-950/30 p-5 sm:p-6 rounded-3xl shadow-xl flex items-center gap-4 border border-red-500/30">
          <div className="p-3.5 rounded-2xl bg-red-500/20 text-red-300 border border-red-500/30 flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-red-300 block uppercase">{t('worker_active_emergencies')}</span>
            <span className="text-2xl sm:text-3xl font-black text-white mt-0.5 block">{totalEmergencies}</span>
          </div>
        </div>
      </div>

      {/* 4. Village-wise Patient Distribution Chart */}
      <div className="gamma-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        <div>
          <h2 className="font-black text-white text-lg sm:text-xl">
            {t('village_health_distribution')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {t('village_health_distribution_sub')}
          </p>
        </div>

        <div className="h-80 sm:h-96 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#cbd5e1', fontWeight: 600 }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Bar dataKey="activePatients" name={t('village_chart_active')} fill="#0d9488" radius={[6, 6, 0, 0]} />
              <Bar dataKey="needingAttention" name={t('village_chart_attention')} fill="#f59e0b" radius={[6, 6, 0, 0]} />
              <Bar dataKey="emergencies" name={t('village_chart_emergencies')} fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Village Health Cards Grid */}
      <div className="space-y-5">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            {t('village_phc_profiles_title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Cluster healthcare coverage breakdown</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {villageStats.map((v, idx) => (
            <div
              key={idx}
              className="gamma-card p-6 rounded-3xl border border-white/10 shadow-2xl hover:border-indigo-500/40 transition-all space-y-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-white text-lg">{v.village}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {t('auth_district')}: {v.district}
                  </p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-400/30 flex-shrink-0">
                  {v.total_citizens} {t('village_population_badge')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950/80 rounded-2xl text-center text-xs border border-white/5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('village_active_monitored')}</span>
                  <span className="font-black text-white text-base mt-0.5 block">{v.active_patients}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('worker_needing_attention')}</span>
                  <span className="font-black text-amber-400 text-base mt-0.5 block">{v.needing_attention}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('worker_active_emergencies')}</span>
                  <span className={`font-black text-base mt-0.5 block ${v.active_emergencies > 0 ? 'text-red-400' : 'text-slate-300'}`}>
                    {v.active_emergencies}
                  </span>
                </div>
              </div>

              <div className="text-xs space-y-2.5 text-slate-300 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-medium text-slate-400">
                    <Stethoscope className="w-4 h-4 text-teal-400" />
                    {t('village_assigned_asha')}
                  </span>
                  <strong className="text-white">{v.asha_worker_name}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-medium text-slate-400">
                    <Hospital className="w-4 h-4 text-indigo-400" />
                    {t('village_nearest_facility')}
                  </span>
                  <strong className="text-white truncate max-w-[210px]">{v.nearest_hospital} ({v.phc_distance_km} km)</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
