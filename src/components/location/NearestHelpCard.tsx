import React, { useState } from 'react';
import { useLocation, KNOWN_VILLAGES } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  MapPin,
  Phone,
  Navigation,
  Building2,
  Ambulance,
  ChevronRight,
  ShieldCheck,
  Crosshair,
  Hospital,
  Edit3,
  Search,
} from 'lucide-react';
import { NearbyHealthcareSearchModal } from './NearbyHealthcareSearchModal';

export const NearestHelpCard: React.FC = () => {
  const {
    gpsLocation,
    nearestPHC,
    nearestAmbulance,
    nearestHospital,
    permissionStatus,
    refreshLocation,
    setManualLocation,
    getGoogleMapsUrl,
  } = useLocation();
  const { t } = useLanguage();

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isManualPickerOpen, setIsManualPickerOpen] = useState(false);

  const handleRefreshLocation = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLocating(true);
    await refreshLocation();
    setIsLocating(false);
  };

  return (
    <>
      <div className="p-6 sm:p-7 rounded-3xl gamma-card bg-gradient-to-br from-slate-900/90 via-teal-950/30 to-slate-900/90 border border-teal-500/30 shadow-2xl relative overflow-hidden space-y-5">
        
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 shadow-md flex-shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-white text-lg sm:text-xl tracking-tight">
                  {t('nearest_phc_heading')}
                </h3>
                <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {gpsLocation?.source === 'gps' ? t('gps_active_badge') : t('gps_village_badge')}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {t('your_location_label')}: <strong className="text-white">{gpsLocation?.address || 'Rampur, Varanasi'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
            {/* Refresh GPS Button */}
            <button
              onClick={handleRefreshLocation}
              disabled={isLocating}
              className="px-3 py-2 bg-slate-900/90 hover:bg-slate-800 text-teal-300 rounded-xl border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              title={t('refresh_gps')}
            >
              <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : t('refresh_gps')}</span>
            </button>

            {/* Manual Location Override */}
            <button
              onClick={() => setIsManualPickerOpen(!isManualPickerOpen)}
              className="px-3 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              title="Select or Change Location Manually"
            >
              <Edit3 className="w-3.5 h-3.5 text-teal-400" />
              <span>Change Location</span>
            </button>

            {/* View All Facilities Search Trigger */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{t('view_all_facilities')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Manual Location Picker Drawer */}
        {isManualPickerOpen && (
          <div className="p-4 bg-slate-950 rounded-2xl border border-teal-500/30 space-y-2.5 animate-fade-in text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-300 uppercase tracking-wider">
                Select Your Village / Location Manually:
              </span>
              <button
                onClick={() => setIsManualPickerOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.keys(KNOWN_VILLAGES).map((vName) => (
                <button
                  key={vName}
                  onClick={() => {
                    setManualLocation(vName);
                    setIsManualPickerOpen(false);
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl border border-white/10 font-medium transition-colors"
                >
                  📍 {vName} ({KNOWN_VILLAGES[vName].district})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3 Facility Cards Grid (Sorted by Nearest Distance) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 1. Nearest Primary Health Centre (PHC) */}
          {nearestPHC && (
            <div className="p-4 sm:p-5 bg-slate-950/80 rounded-2xl border border-white/10 flex flex-col justify-between space-y-3.5 shadow-md">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    24x7 Primary Health Centre
                  </span>
                  <span className="text-xs font-black text-emerald-300 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                    {nearestPHC.distanceKm} km • ~{nearestPHC.estimatedTimeMins} mins
                  </span>
                </div>
                <h4 className="font-black text-white text-base mt-1">{nearestPHC.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{nearestPHC.address}</p>
                {nearestPHC.doctorOnDuty && (
                  <p className="text-[11px] text-slate-300 font-medium mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{nearestPHC.doctorOnDuty}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <a
                  href={`tel:${nearestPHC.phone}`}
                  className="flex-1 py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call PHC</span>
                </a>
                <a
                  href={getGoogleMapsUrl(nearestPHC.latitude, nearestPHC.longitude)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-white/10 flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Directions</span>
                </a>
              </div>
            </div>
          )}

          {/* 2. Nearest 108 Emergency Ambulance */}
          {nearestAmbulance && (
            <div className="p-4 sm:p-5 bg-slate-950/80 rounded-2xl border border-white/10 flex flex-col justify-between space-y-3.5 shadow-md">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1">
                    <Ambulance className="w-3.5 h-3.5" />
                    National 108 Ambulance
                  </span>
                  <span className="text-xs font-black text-red-300 px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30">
                    {nearestAmbulance.distanceKm} km • ~{nearestAmbulance.estimatedTimeMins} mins
                  </span>
                </div>
                <h4 className="font-black text-white text-base mt-1">{nearestAmbulance.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{nearestAmbulance.address}</p>
                <p className="text-[11px] text-slate-300 font-medium mt-1.5">
                  24/7 Mobile Oxygen & Paramedic Unit
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <a
                  href="tel:108"
                  className="flex-1 py-2.5 px-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-red-600/20"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call 108</span>
                </a>
                <button
                  onClick={() => setIsSearchModalOpen(true)}
                  className="py-2.5 px-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-white/10 cursor-pointer"
                >
                  {t('view_all')}
                </button>
              </div>
            </div>
          )}

          {/* 3. Nearest District Hospital & Trauma Centre */}
          {nearestHospital && (
            <div className="p-4 sm:p-5 bg-slate-950/80 rounded-2xl border border-white/10 flex flex-col justify-between space-y-3.5 shadow-md">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                    <Hospital className="w-3.5 h-3.5" />
                    Govt District Hospital / Trauma
                  </span>
                  <span className="text-xs font-black text-indigo-300 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30">
                    {nearestHospital.distanceKm} km • ~{nearestHospital.estimatedTimeMins} mins
                  </span>
                </div>
                <h4 className="font-black text-white text-base mt-1">{nearestHospital.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{nearestHospital.address}</p>
                <p className="text-[11px] text-slate-300 font-medium mt-1.5">
                  ICU, Emergency Surgery & 150 Inpatient Beds
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <a
                  href={`tel:${nearestHospital.phone}`}
                  className="flex-1 py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Hospital</span>
                </a>
                <a
                  href={getGoogleMapsUrl(nearestHospital.latitude, nearestHospital.longitude)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-white/10 flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Directions</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Facility Search & Filter Modal */}
      <NearbyHealthcareSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </>
  );
};
