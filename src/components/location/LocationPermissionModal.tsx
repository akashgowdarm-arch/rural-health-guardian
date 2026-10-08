import React, { useState } from 'react';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  MapPin,
  ShieldAlert,
  Navigation,
  Crosshair,
  Building2,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
} from 'lucide-react';

export const LocationPermissionModal: React.FC = () => {
  const { showPermissionModal, setShowPermissionModal, requestLocation, permissionStatus, gpsLocation } = useLocation();
  const { language, t } = useLanguage();
  const [isRequesting, setIsRequesting] = useState(false);
  const [justGranted, setJustGranted] = useState(false);

  if (!showPermissionModal) return null;

  const handleEnableGPS = async () => {
    setIsRequesting(true);
    const success = await requestLocation();
    setIsRequesting(false);
    if (success) {
      setJustGranted(true);
      setTimeout(() => {
        setShowPermissionModal(false);
        setJustGranted(false);
      }, 1800);
    }
  };

  const handleDismiss = () => {
    setShowPermissionModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-black/85 backdrop-blur-md flex items-center justify-center animate-fade-in">
      <div className="relative w-full max-w-lg gamma-card bg-slate-950/95 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-2xl space-y-6 overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 rounded-full blur-sm" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Radar Icon & Header */}
        <div className="text-center space-y-3 pt-2">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Crosshair className={`w-8 h-8 ${isRequesting ? 'animate-spin' : 'animate-pulse'}`} />
            </div>
            <div className="absolute -inset-1 rounded-3xl bg-emerald-500/10 animate-ping pointer-events-none" />
          </div>

          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              {t('gps_safety_feature')}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2">
              {t('gps_modal_title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
              {t('gps_modal_sub')}
            </p>
          </div>
        </div>

        {/* Value Points */}
        <div className="space-y-3 p-4 bg-slate-900/80 rounded-2xl border border-white/10 text-xs text-slate-300">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 flex-shrink-0 mt-0.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-white block">{t('gps_feat_sos_title')}</strong>
              <span className="text-slate-400">{t('gps_feat_sos_sub')}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex-shrink-0 mt-0.5">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-white block">{t('gps_feat_phc_title')}</strong>
              <span className="text-slate-400">{t('gps_feat_phc_sub')}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex-shrink-0 mt-0.5">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-white block">{t('gps_feat_asha_title')}</strong>
              <span className="text-slate-400">{t('gps_feat_asha_sub')}</span>
            </div>
          </div>
        </div>

        {/* Live Coordinate Confirmation If Granted */}
        {justGranted && gpsLocation && (
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs animate-fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <div>
              <strong className="block text-white">✓ GPS Location Detected!</strong>
              <span className="font-mono text-[11px] text-emerald-300">
                Lat: {gpsLocation.latitude}°, Lng: {gpsLocation.longitude}° (Accuracy: ±{gpsLocation.accuracy}m)
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={handleEnableGPS}
            disabled={isRequesting || justGranted}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
            <span>
              {isRequesting
                ? t('gps_requesting_btn')
                : justGranted
                ? t('gps_granted_btn')
                : t('gps_allow_btn')}
            </span>
          </button>

          <button
            onClick={handleDismiss}
            disabled={isRequesting}
            className="w-full py-2.5 px-4 bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-bold text-xs rounded-xl border border-white/10 transition-colors"
          >
            {t('gps_use_village_fallback')}
          </button>
        </div>
      </div>
    </div>
  );
};
