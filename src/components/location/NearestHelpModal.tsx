import React from 'react';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  X,
  MapPin,
  Phone,
  Navigation,
  Building2,
  Ambulance,
  UserCheck,
  Hospital,
  Clock,
  Bed,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NearestHelpModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { nearbyFacilities, gpsLocation, getGoogleMapsUrl } = useLocation();
  const { t } = useLanguage();

  if (!isOpen) return null;

  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'phc':
        return <Building2 className="w-5 h-5 text-emerald-400" />;
      case 'ambulance_base':
        return <Ambulance className="w-5 h-5 text-red-400" />;
      case 'asha_subcenter':
        return <UserCheck className="w-5 h-5 text-teal-400" />;
      case 'chc':
      case 'district_hospital':
      default:
        return <Hospital className="w-5 h-5 text-indigo-400" />;
    }
  };

  const getFacilityBadge = (type: string) => {
    switch (type) {
      case 'phc':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">24x7 PHC</span>;
      case 'ambulance_base':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/30">108 Emergency</span>;
      case 'asha_subcenter':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">ASHA Center</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Hospital</span>;
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 bg-black/85 backdrop-blur-md flex items-center justify-center animate-fade-in"
    >
      <div className="relative w-full max-w-3xl bg-slate-950/95 text-slate-100 rounded-3xl shadow-2xl border border-white/15 ring-1 ring-white/10 flex flex-col my-auto max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/30 shadow-md">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">{t('facilities_modal_title')}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {gpsLocation?.source === 'gps' ? 'Live GPS' : 'Village Reference'}
                </span>
              </div>
              <p className="text-xs text-slate-300">{t('facilities_modal_sub')}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Facility List */}
        <div className="flex-1 overflow-y-auto modal-scroll-area p-5 sm:p-6 space-y-4">
          
          {/* User Location Bar */}
          <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-white/10 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                <strong>{t('your_location_label')}:</strong> {gpsLocation?.address || 'Rampur, Varanasi'}
              </span>
            </div>
            <a
              href={getGoogleMapsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-bold whitespace-nowrap"
            >
              <span>{t('view_on_map')}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Facilities Cards */}
          <div className="space-y-3.5">
            {nearbyFacilities.map((fac) => (
              <div
                key={fac.id}
                className="p-4 sm:p-5 bg-slate-900/70 hover:bg-slate-900/90 rounded-2xl border border-white/10 shadow-md transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10 flex-shrink-0">
                      {getFacilityIcon(fac.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-white text-sm sm:text-base">{fac.name}</h3>
                        {getFacilityBadge(fac.type)}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{fac.address}</p>
                    </div>
                  </div>

                  {/* Distance & ETA */}
                  <div className="flex items-center gap-2.5 self-start sm:self-center text-xs font-bold">
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {fac.distanceKm} km
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {fac.estimatedTimeMins} mins
                    </span>
                  </div>
                </div>

                {/* Info row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-white/5">
                  {fac.doctorOnDuty && (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span><strong>On Duty:</strong> {fac.doctorOnDuty}</span>
                    </div>
                  )}
                  {fac.availableBeds !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <Bed className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                      <span><strong>Available Beds:</strong> {fac.availableBeds} beds</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <a
                    href={`tel:${fac.phone}`}
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call ({fac.phone})</span>
                  </a>

                  <a
                    href={getGoogleMapsUrl(fac.latitude, fac.longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-white/10 flex items-center gap-1.5 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Directions</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>National Emergency Helpline: <strong className="text-white font-bold">108 (Ambulance) / 102 (Pregnancy/Child)</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
