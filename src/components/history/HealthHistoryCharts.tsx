import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHealth } from '../../context/HealthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  AreaChart,
  Area,
} from 'recharts';
import {
  History,
  Printer,
  Heart,
  Droplet,
  Wind,
  Thermometer,
  Activity,
} from 'lucide-react';

export const HealthHistoryCharts: React.FC = () => {
  const { currentUser } = useAuth();
  const { patientReadings } = useHealth();
  const { t, language } = useLanguage();

  const [timeFilter, setTimeFilter] = useState<'today' | '7d' | '30d'>('7d');
  const [activeMetric, setActiveMetric] = useState<'bp' | 'hr' | 'spo2' | 'temp' | 'sugar'>('bp');

  const now = new Date().getTime();
  const filteredReadings = patientReadings.filter((r) => {
    const readingTime = new Date(r.recorded_at).getTime();
    if (timeFilter === 'today') {
      return now - readingTime <= 24 * 60 * 60 * 1000;
    } else if (timeFilter === '7d') {
      return now - readingTime <= 7 * 24 * 60 * 60 * 1000;
    } else {
      return now - readingTime <= 30 * 24 * 60 * 60 * 1000;
    }
  });

  const chartData = [...filteredReadings]
    .reverse()
    .map((r) => ({
      date: new Date(r.recorded_at).toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'kn' ? 'kn-IN' : 'en-IN', { month: 'short', day: 'numeric' }),
      time: new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      label: `${new Date(r.recorded_at).toLocaleDateString([], { month: 'numeric', day: 'numeric' })} ${new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      heart_rate: r.heart_rate,
      systolic_bp: r.systolic_bp,
      diastolic_bp: r.diastolic_bp,
      temperature: r.temperature,
      spo2: r.spo2,
      blood_sugar: r.blood_sugar,
    }));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-10 sm:space-y-12 max-w-7xl mx-auto px-4 sm:px-8 py-8 animate-fade-in text-slate-100">
      
      {/* 1. Header & Controls Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-md">
              <History className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{t('history_title')}</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 pl-0.5">
            {t('history_sub_prefix')} <strong className="text-white">{currentUser.name}</strong> ({currentUser.village})
          </p>
        </div>

        {/* Time Filters & Print */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="bg-slate-900/90 p-1.5 rounded-2xl flex items-center gap-1.5 border border-white/10 backdrop-blur-md shadow-md">
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                timeFilter === 'today' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('history_filter_today')}
            </button>
            <button
              onClick={() => setTimeFilter('7d')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                timeFilter === '7d' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('history_filter_7d')}
            </button>
            <button
              onClick={() => setTimeFilter('30d')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                timeFilter === '30d' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('history_filter_30d')}
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-200 font-bold text-xs rounded-2xl shadow-md flex items-center gap-2 transition-colors backdrop-blur-md"
            title={t('history_print_report')}
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">{t('history_print_report')}</span>
          </button>
        </div>
      </div>

      {/* 2. Metric Switcher Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'bp' as const, label: t('vital_bp'), icon: <Droplet className="w-4 h-4 text-red-400" />, unit: 'mmHg' },
          { id: 'hr' as const, label: t('vital_heart_rate'), icon: <Heart className="w-4 h-4 text-rose-400" />, unit: 'BPM' },
          { id: 'spo2' as const, label: t('vital_spo2'), icon: <Wind className="w-4 h-4 text-cyan-400" />, unit: '%' },
          { id: 'temp' as const, label: t('vital_temp'), icon: <Thermometer className="w-4 h-4 text-amber-400" />, unit: '°C' },
          { id: 'sugar' as const, label: t('vital_sugar'), icon: <Activity className="w-4 h-4 text-purple-400" />, unit: 'mg/dL' },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveMetric(m.id)}
            className={`px-5 py-3 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2.5 whitespace-nowrap transition-all shadow-md ${
              activeMetric === m.id
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400/40 shadow-emerald-600/25 ring-2 ring-emerald-400/30'
                : 'bg-slate-900/80 text-slate-300 border-white/10 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {m.icon}
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* 3. Main Interactive Recharts Graph */}
      <div className="gamma-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        <div>
          <h3 className="font-black text-white text-lg sm:text-xl">
            {activeMetric === 'bp' && t('history_bp_trend_title')}
            {activeMetric === 'hr' && t('history_hr_trend_title')}
            {activeMetric === 'spo2' && t('history_spo2_trend_title')}
            {activeMetric === 'temp' && t('history_temp_trend_title')}
            {activeMetric === 'sugar' && t('history_sugar_trend_title')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {activeMetric === 'bp' && t('history_bp_trend_sub')}
            {activeMetric === 'hr' && t('history_hr_trend_sub')}
            {activeMetric === 'spo2' && t('history_spo2_trend_sub')}
            {activeMetric === 'temp' && t('history_temp_trend_sub')}
            {activeMetric === 'sugar' && t('history_sugar_trend_sub')}
          </p>
        </div>

        {chartData.length > 0 ? (
          <div className="h-80 sm:h-96 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              {activeMetric === 'bp' ? (
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis domain={[40, 200]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                  />
                  <ReferenceLine y={120} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Sys 120', fill: '#10b981', fontSize: 10 }} />
                  <ReferenceLine y={140} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'High Sys 140', fill: '#f59e0b', fontSize: 10 }} />
                  <Line type="monotone" dataKey="systolic_bp" name={t('entry_sys_label')} stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 7 }} />
                  <Line type="monotone" dataKey="diastolic_bp" name={t('entry_dia_label')} stroke="#06b6d4" strokeWidth={2} dot={{ r: 4, fill: '#06b6d4' }} activeDot={{ r: 6 }} />
                </LineChart>
              ) : activeMetric === 'hr' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis domain={[40, 150]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                  <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Max 100', fill: '#f59e0b', fontSize: 10 }} />
                  <ReferenceLine y={60} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Min 60', fill: '#10b981', fontSize: 10 }} />
                  <Area type="monotone" dataKey="heart_rate" name={t('vital_heart_rate')} stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#hrGrad)" />
                </AreaChart>
              ) : activeMetric === 'spo2' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spo2Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis domain={[75, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                  <ReferenceLine y={95} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Target 95%', fill: '#10b981', fontSize: 10 }} />
                  <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '<90%', fill: '#ef4444', fontSize: 10 }} />
                  <Area type="monotone" dataKey="spo2" name={t('vital_spo2')} stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#spo2Grad)" />
                </AreaChart>
              ) : activeMetric === 'temp' ? (
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis domain={[34.0, 41.0]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                  <ReferenceLine y={37.5} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '37.5°C', fill: '#f59e0b', fontSize: 10 }} />
                  <Line type="monotone" dataKey="temperature" name={t('vital_temp')} stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} />
                </LineChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sugarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis domain={[50, 300]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                  <ReferenceLine y={140} stroke="#10b981" strokeDasharray="3 3" label={{ value: '<140', fill: '#10b981', fontSize: 10 }} />
                  <ReferenceLine y={180} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '>180', fill: '#ef4444', fontSize: 10 }} />
                  <Area type="monotone" dataKey="blood_sugar" name={t('vital_sugar')} stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#sugarGrad)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500 text-sm">
            {t('history_no_readings_range')}
          </div>
        )}
      </div>

      {/* 4. Detailed Log Table */}
      <div className="gamma-card rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-black text-white text-base sm:text-lg">{t('history_log_table_title')}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Full historical records</p>
          </div>
          <span className="text-xs font-semibold text-slate-300 bg-slate-900 px-3 py-1 rounded-full border border-white/10">
            {filteredReadings.length} {t('history_records_found')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-white/10">
              <tr>
                <th className="px-6 py-4">{t('history_th_datetime')}</th>
                <th className="px-5 py-4">{t('history_th_hr')}</th>
                <th className="px-5 py-4">{t('history_th_bp')}</th>
                <th className="px-5 py-4">{t('history_th_spo2')}</th>
                <th className="px-5 py-4">{t('history_th_temp')}</th>
                <th className="px-5 py-4">{t('history_th_sugar')}</th>
                <th className="px-6 py-4">{t('history_th_status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredReadings.map((r) => (
                <tr key={r.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-white whitespace-nowrap">
                    {new Date(r.recorded_at).toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'kn' ? 'kn-IN' : 'en-IN')} {new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-5 py-4 text-slate-200 font-medium">
                    {r.heart_rate} BPM
                  </td>
                  <td className="px-5 py-4 font-bold text-white">
                    <span className={r.systolic_bp >= 140 ? 'text-amber-400' : ''}>
                      {r.systolic_bp} / {r.diastolic_bp} mmHg
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold">
                    <span className={r.spo2 < 92 ? 'text-red-400' : 'text-slate-200'}>
                      {r.spo2}%
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-200 font-medium">
                    {r.temperature}°C
                  </td>
                  <td className="px-5 py-4 font-bold text-white">
                    {r.blood_sugar} mg/dL {r.meal_status ? `(${r.meal_status === 'fasting' ? t('entry_fasting')[0] : r.meal_status === 'post_prandial' ? t('entry_post_prandial')[0] : t('entry_random')[0]})` : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {r.spo2 < 90 || r.systolic_bp >= 160 ? (
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">{t('status_critical')}</span>
                    ) : r.systolic_bp >= 135 || r.spo2 <= 94 ? (
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">{t('status_attention')}</span>
                    ) : (
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">{t('status_normal')}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
