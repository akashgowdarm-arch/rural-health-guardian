import React from 'react';
import { useHealth } from '../../context/HealthContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { EmergencyAlert, AlertStatus } from '../../types';
import {
  ShieldAlert,
  Phone,
  MapPin,
  Clock,
  Flame,
  Wind,
  HeartPulse,
} from 'lucide-react';

export const EmergencyAlertsList: React.FC = () => {
  const { emergencyAlerts, acknowledgeAlert, updateAlertStatus } = useHealth();
  const { currentUser } = useAuth();
  const { t, language } = useLanguage();

  const getAlertIcon = (type: EmergencyAlert['alert_type']) => {
    switch (type) {
      case 'cardiac':
        return <HeartPulse className="w-5 h-5 text-red-400" />;
      case 'breathing':
        return <Wind className="w-5 h-5 text-cyan-400" />;
      case 'fever_convulsion':
        return <Flame className="w-5 h-5 text-orange-400" />;
      default:
        return <ShieldAlert className="w-5 h-5 text-red-400" />;
    }
  };

  const getPriorityBadge = (p: EmergencyAlert['priority']) => {
    switch (p) {
      case 'critical':
        return <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-red-600 text-white uppercase tracking-wider animate-pulse shadow-md shadow-red-600/30">{t('status_critical')} SOS</span>;
      case 'high':
        return <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">{t('risk_high')}</span>;
      default:
        return <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">{t('risk_medium')}</span>;
    }
  };

  const getStatusPill = (status: AlertStatus) => {
    switch (status) {
      case 'new':
        return <span className="text-xs px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 font-bold border border-red-500/40">● {t('worker_alert_status_new')}</span>;
      case 'acknowledged':
        return <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">✓ {t('worker_alert_status_acknowledged')}</span>;
      case 'responding':
        return <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40">🚑 {t('worker_alert_status_responding')}</span>;
      case 'resolved':
        return <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">✓ {t('worker_alert_status_resolved')}</span>;
    }
  };

  return (
    <div className="space-y-4 text-slate-100">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          <span>{t('worker_active_dispatch_title')} ({emergencyAlerts.length})</span>
        </h2>
      </div>

      <div className="space-y-3">
        {emergencyAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 sm:p-5 rounded-3xl border transition-all shadow-xl ${
              alert.status === 'new'
                ? 'gamma-card-glow-red bg-red-950/35 ring-1 ring-red-500/40'
                : alert.status === 'responding'
                ? 'bg-blue-950/30 border-blue-500/40 shadow-blue-500/10'
                : alert.status === 'resolved'
                ? 'bg-slate-900/60 border-white/5 opacity-75'
                : 'gamma-card'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-slate-950/80 shadow-md border border-white/10 flex-shrink-0 mt-0.5">
                  {getAlertIcon(alert.alert_type)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-white text-base">{alert.user_name}</h3>
                    {getPriorityBadge(alert.priority)}
                    {getStatusPill(alert.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      {alert.village}, {alert.district}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(alert.created_at).toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'kn' ? 'kn-IN' : 'en-IN')})
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`tel:${alert.phone}`}
                  className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-200 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('worker_call_patient')}</span>
                </a>

                {alert.status === 'new' && (
                  <button
                    onClick={() => acknowledgeAlert(alert.id, currentUser.name)}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                  >
                    {t('worker_ack_btn')}
                  </button>
                )}

                {alert.status === 'acknowledged' && (
                  <button
                    onClick={() => updateAlertStatus(alert.id, 'responding', 'ASHA Worker dispatched to home.')}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                  >
                    {t('worker_set_responding_btn')}
                  </button>
                )}

                {alert.status === 'responding' && (
                  <button
                    onClick={() => updateAlertStatus(alert.id, 'resolved', 'Patient stabilized. Emergency resolved.')}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                  >
                    {t('worker_mark_resolved_btn')}
                  </button>
                )}
              </div>
            </div>

            {/* Vitals Snapshot at Trigger Time */}
            {alert.latest_vitals && (
              <div className="mt-3 text-xs flex flex-wrap items-center gap-2.5 text-slate-300 bg-slate-950/80 p-2.5 rounded-xl border border-white/10">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">{t('sos_snapshot_vitals_label')}</span>
                {alert.latest_vitals.heart_rate && (
                  <span className="font-semibold">HR: <strong className="text-white">{alert.latest_vitals.heart_rate} BPM</strong></span>
                )}
                {alert.latest_vitals.systolic_bp && (
                  <span className="font-semibold">BP: <strong className="text-white">{alert.latest_vitals.systolic_bp}/{alert.latest_vitals.diastolic_bp} mmHg</strong></span>
                )}
                {alert.latest_vitals.spo2 && (
                  <span className={`font-semibold ${alert.latest_vitals.spo2 < 90 ? 'text-red-400 font-black' : 'text-slate-200'}`}>
                    SpO2: <strong className="text-white">{alert.latest_vitals.spo2}%</strong>
                  </span>
                )}
                {alert.latest_vitals.temperature && (
                  <span className="font-semibold">Temp: <strong className="text-white">{alert.latest_vitals.temperature}°C</strong></span>
                )}
              </div>
            )}

            {/* Responder Notes */}
            {alert.responder_notes && (
              <div className="mt-2 text-xs text-slate-400 italic bg-slate-900/60 p-2 rounded-lg border border-white/5">
                <strong className="text-slate-300">{t('worker_dispatch_note_label')}</strong> {alert.responder_notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
