import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHealth } from '../../context/HealthContext';
import { useLocation, KNOWN_VILLAGES } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { EmergencyAlert, NearbyFacility } from '../../types';
import {
  ShieldAlert,
  X,
  PhoneCall,
  MapPin,
  HeartPulse,
  CheckCircle,
  Radio,
  Flame,
  Wind,
  Activity,
  Navigation,
  ExternalLink,
  Share2,
  Phone,
  Building2,
  Hospital,
  Ambulance,
  Crosshair,
  Edit3,
  Clock,
  Check,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SOSButtonModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { triggerEmergencySOS, latestReading } = useHealth();
  const {
    gpsLocation,
    permissionStatus,
    requestLocation,
    refreshLocation,
    setManualLocation,
    getRecommendedFacilitiesForRisk,
    getGoogleMapsUrl,
    getShareLocationText,
  } = useLocation();
  const { t } = useLanguage();

  const [selectedType, setSelectedType] = useState<EmergencyAlert['alert_type']>('cardiac');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isSent, setIsSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCopiedShare, setIsCopiedShare] = useState(false);
  const [isManualPickerOpen, setIsManualPickerOpen] = useState(false);

  // When Emergency Modal opens, trigger GPS request if not yet granted
  useEffect(() => {
    if (isOpen) {
      setCountdown(null);
      setIsSent(false);
      setIsSending(false);
      if (permissionStatus !== 'granted') {
        requestLocation();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      handleDirectSend();
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleStartCountdown = () => {
    setCountdown(3);
  };

  const handleDirectSend = async () => {
    setCountdown(null);
    setIsSending(true);
    
    const coords = gpsLocation ? {
      latitude: gpsLocation.latitude,
      longitude: gpsLocation.longitude,
      maps_url: getGoogleMapsUrl(),
    } : undefined;

    await triggerEmergencySOS(selectedType, undefined, coords);
    setIsSending(false);
    setIsSent(true);
  };

  const handleShareLocation = () => {
    const shareText = getShareLocationText();
    if (navigator.share) {
      navigator.share({
        title: 'EMERGENCY MEDICAL SOS',
        text: shareText,
        url: getGoogleMapsUrl(),
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText);
        setIsCopiedShare(true);
        setTimeout(() => setIsCopiedShare(false), 2500);
      });
    } else {
      navigator.clipboard.writeText(shareText);
      setIsCopiedShare(true);
      setTimeout(() => setIsCopiedShare(false), 2500);
    }
  };

  if (!isOpen) return null;

  const emergencyTypes = [
    { id: 'cardiac' as const, label: t('sos_type_cardiac'), icon: <HeartPulse className="w-5 h-5 text-red-400" /> },
    { id: 'breathing' as const, label: t('sos_type_breathing'), icon: <Wind className="w-5 h-5 text-cyan-400" /> },
    { id: 'fall_injury' as const, label: t('sos_type_fall'), icon: <Activity className="w-5 h-5 text-amber-400" /> },
    { id: 'fever_convulsion' as const, label: t('sos_type_fever'), icon: <Flame className="w-5 h-5 text-orange-400" /> },
    { id: 'sos_button' as const, label: t('sos_type_general'), icon: <ShieldAlert className="w-5 h-5 text-purple-400" /> },
  ];

  const recommendedFacilities = getRecommendedFacilitiesForRisk(selectedType);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-6 bg-black/90 backdrop-blur-md flex items-center justify-center animate-fade-in text-slate-100"
    >
      <div className="relative w-full max-w-2xl bg-slate-950/98 rounded-3xl shadow-2xl border border-red-500/40 flex flex-col my-auto max-h-[94vh] overflow-hidden">
        
        {/* Emergency Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-red-950 via-rose-950 to-red-950 p-4 sm:p-6 relative border-b border-red-500/40 z-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
            title={t('close')}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-400/50 flex items-center justify-center text-red-300 shadow-xl shadow-red-500/30 animate-pulse">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">{t('sos_button')}</h2>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-600 text-white tracking-wider animate-pulse">
                  CRITICAL EMERGENCY MODE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-red-200 font-medium">{t('sos_subtext')}</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-h-0 p-4 sm:p-6 space-y-5 overflow-y-auto modal-scroll-area overscroll-contain focus:outline-none">
          
          {/* 3 Large Accessible Emergency Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Call 108 Ambulance */}
            <a
              href="tel:108"
              className="p-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white flex flex-col justify-between shadow-xl shadow-red-600/30 border border-red-400/40 active:scale-95 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-100">National Dispatch</span>
                <PhoneCall className="w-5 h-5 animate-bounce text-white" />
              </div>
              <div className="mt-2">
                <p className="text-base sm:text-lg font-black leading-tight">Call 108</p>
                <p className="text-[11px] text-red-100 font-medium">Emergency Ambulance</p>
              </div>
            </a>

            {/* 2. Call Emergency Contact */}
            <a
              href={`tel:${currentUser.emergency_contact.phone}`}
              className="p-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white flex flex-col justify-between shadow-xl shadow-amber-600/30 border border-amber-400/40 active:scale-95 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-100">Family / Kin</span>
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div className="mt-2 truncate">
                <p className="text-sm sm:text-base font-black leading-tight truncate">Call Contact</p>
                <p className="text-[11px] text-amber-100 font-medium truncate">{currentUser.emergency_contact.name} ({currentUser.emergency_contact.phone})</p>
              </div>
            </a>

            {/* 3. Share Current Location */}
            <button
              onClick={handleShareLocation}
              className="p-4 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white flex flex-col justify-between shadow-xl shadow-teal-600/30 border border-teal-400/40 active:scale-95 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-100">GPS Sharing</span>
                {isCopiedShare ? <Check className="w-5 h-5 text-white" /> : <Share2 className="w-5 h-5 text-white" />}
              </div>
              <div className="mt-2">
                <p className="text-sm sm:text-base font-black leading-tight">
                  {isCopiedShare ? '✓ Link Copied!' : 'Share Location'}
                </p>
                <p className="text-[11px] text-teal-100 font-medium">SMS / WhatsApp Map</p>
              </div>
            </button>
          </div>

          {/* Location Status & Refresh/Override Bar */}
          <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-white/10 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-pulse" />
                <span className="text-slate-300">
                  <strong>{t('your_location_label')}:</strong> <span className="text-white font-bold">{gpsLocation?.address || `${currentUser.village}, ${currentUser.district}`}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  onClick={() => refreshLocation()}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg border border-white/10 text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <Crosshair className="w-3 h-3" />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={() => setIsManualPickerOpen(!isManualPickerOpen)}
                  className="px-2.5 py-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded-lg border border-teal-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Change</span>
                </button>
              </div>
            </div>

            {/* Manual village picker */}
            {isManualPickerOpen && (
              <div className="p-3 bg-slate-950 rounded-xl border border-teal-500/30 space-y-2 text-xs">
                <p className="text-[11px] font-bold text-teal-300 uppercase">Select Location Manually:</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(KNOWN_VILLAGES).map((vName) => (
                    <button
                      key={vName}
                      onClick={() => {
                        setManualLocation(vName);
                        setIsManualPickerOpen(false);
                      }}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-white/10 text-[11px]"
                    >
                      📍 {vName}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isSent ? (
            /* Success State */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/10 shadow-xl">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-white">{t('sos_transmitted_title')}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed px-2">
                  {t('sos_alert_sent')}
                </p>
              </div>

              {/* Alert Payload Details */}
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-white/10 text-left text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400 font-medium">{t('sos_patient_label')}</span>
                  <span className="font-bold text-white">{currentUser.name} ({currentUser.age} yrs, {currentUser.gender})</span>
                </div>
                
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400 font-medium">{t('sos_location_label')}</span>
                  <div className="text-right">
                    <span className="font-bold text-white flex items-center gap-1 justify-end">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      {gpsLocation?.address || `${currentUser.village}, ${currentUser.district}`}
                    </span>
                    {gpsLocation && (
                      <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                        Lat: {gpsLocation.latitude}°, Lng: {gpsLocation.longitude}°
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400 font-medium">{t('sos_contact_notified_label')}</span>
                  <span className="font-bold text-white">{currentUser.emergency_contact.phone} ({currentUser.emergency_contact.name})</span>
                </div>

                {latestReading && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400 font-medium">{t('sos_snapshot_vitals_label')}</span>
                    <span className="font-semibold text-slate-200">
                      HR: {latestReading.heart_rate} | BP: {latestReading.systolic_bp}/{latestReading.diastolic_bp} | SpO2: {latestReading.spo2}%
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 text-xs text-slate-400 font-bold hover:bg-slate-900 rounded-xl transition-colors"
              >
                {t('close')}
              </button>
            </div>
          ) : (
            /* Emergency Trigger & Risk-Prioritized Facilities */
            <div className="space-y-5">
              {/* Emergency Condition Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  {t('sos_select_type')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {emergencyTypes.map((typeObj) => (
                    <button
                      key={typeObj.id}
                      onClick={() => setSelectedType(typeObj.id)}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                        selectedType === typeObj.id
                          ? 'bg-red-500/20 border-red-500 text-white ring-2 ring-red-500/40 shadow-md'
                          : 'bg-slate-900/60 border-white/10 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-slate-950 border border-white/10 flex-shrink-0">
                        {typeObj.icon}
                      </div>
                      <span className="font-bold text-xs leading-tight">{typeObj.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prioritized Healthcare Facilities based on Emergency Category */}
              <div className="space-y-3 p-4 bg-slate-900/90 rounded-2xl border border-teal-500/30">
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Hospital className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      Recommended Facilities for {emergencyTypes.find((t) => t.id === selectedType)?.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Closest First
                  </span>
                </div>

                <div className="space-y-2.5">
                  {recommendedFacilities.map((fac) => (
                    <div
                      key={fac.id}
                      className="p-3 bg-slate-950/90 rounded-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-white">{fac.name}</h4>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                            {fac.distanceKm} km • ~{fac.estimatedTimeMins}m
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{fac.address}</p>
                        {fac.doctorOnDuty && (
                          <p className="text-[10px] text-teal-300 font-medium">Dr: {fac.doctorOnDuty}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <a
                          href={`tel:${fac.phone}`}
                          className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call</span>
                        </a>
                        <a
                          href={getGoogleMapsUrl(fac.latitude, fac.longitude)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-white/10 flex items-center gap-1"
                        >
                          <Navigation className="w-3 h-3 text-cyan-400" />
                          <span>Directions</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main SOS Trigger Button */}
              <div className="pt-2 space-y-2">
                {countdown !== null ? (
                  <div className="space-y-3 text-center py-2">
                    <div className="w-16 h-16 rounded-full bg-red-600 text-white font-black text-2xl flex items-center justify-center mx-auto animate-ping shadow-2xl">
                      {countdown}
                    </div>
                    <p className="text-xs font-bold text-red-300">{t('sos_countdown_label')} {countdown}s...</p>
                    <button
                      onClick={() => setCountdown(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-white/10 cursor-pointer"
                    >
                      {t('sos_cancel_countdown')}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleStartCountdown}
                    disabled={isSending}
                    className="w-full py-4 px-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-base rounded-2xl shadow-xl shadow-red-600/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-red-400/40 cursor-pointer"
                  >
                    <Radio className="w-5 h-5 animate-pulse" />
                    <span>{t('sos_confirm')}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
