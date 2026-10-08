import React, { useState } from 'react';
import { useLocation, KNOWN_VILLAGES } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { NearbyFacility } from '../../types';
import {
  X,
  MapPin,
  Phone,
  Navigation,
  Building2,
  Ambulance,
  Hospital,
  Clock,
  Bed,
  CheckCircle2,
  ExternalLink,
  Search,
  Crosshair,
  Filter,
  ShieldCheck,
  Edit3,
  Stethoscope,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NearbyHealthcareSearchModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    nearbyFacilities,
    gpsLocation,
    refreshLocation,
    setManualLocation,
    getGoogleMapsUrl,
  } = useLocation();
  const { t } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isManualPickerOpen, setIsManualPickerOpen] = useState(false);
  const [customInputLoc, setCustomInputLoc] = useState('');

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshLocation();
    setIsRefreshing(false);
  };

  const handleSelectVillage = (villageName: string) => {
    setManualLocation(villageName);
    setIsManualPickerOpen(false);
  };

  const handleCustomLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInputLoc.trim()) {
      setManualLocation(customInputLoc.trim());
      setIsManualPickerOpen(false);
      setCustomInputLoc('');
    }
  };

  // Filter facilities
  const filteredFacilities = nearbyFacilities.filter((fac) => {
    // Category match
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'hospital' && fac.category !== 'government_hospital') return false;
      if (selectedCategory === 'phc' && fac.category !== 'phc') return false;
      if (selectedCategory === 'clinic' && fac.category !== 'clinic' && fac.type !== 'asha_subcenter') return false;
      if (selectedCategory === 'ambulance' && fac.category !== 'ambulance') return false;
    }

    // Search match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = fac.name.toLowerCase().includes(q);
      const matchAddress = fac.address.toLowerCase().includes(q);
      const matchDoctor = fac.doctorOnDuty?.toLowerCase().includes(q);
      const matchSpecialty = fac.specialties?.some((s) => s.toLowerCase().includes(q));
      return matchName || matchAddress || matchDoctor || matchSpecialty;
    }

    return true;
  });

  const getCategoryBadge = (fac: NearbyFacility) => {
    switch (fac.category) {
      case 'government_hospital':
        return <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">Govt Hospital / Trauma</span>;
      case 'phc':
        return <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">24x7 PHC Centre</span>;
      case 'ambulance':
        return <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">108 Emergency Unit</span>;
      case 'chc':
        return <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">CHC Community Centre</span>;
      default:
        return <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">Local Health Clinic</span>;
    }
  };

  const getCategoryIcon = (fac: NearbyFacility) => {
    switch (fac.category) {
      case 'government_hospital':
        return <Hospital className="w-5 h-5 text-red-400" />;
      case 'phc':
        return <Building2 className="w-5 h-5 text-emerald-400" />;
      case 'ambulance':
        return <Ambulance className="w-5 h-5 text-rose-400" />;
      default:
        return <Stethoscope className="w-5 h-5 text-teal-400" />;
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 bg-black/85 backdrop-blur-md flex items-center justify-center animate-fade-in"
    >
      <div className="relative w-full max-w-4xl bg-slate-950/95 text-slate-100 rounded-3xl shadow-2xl border border-white/15 ring-1 ring-white/10 flex flex-col my-auto max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/30 shadow-md">
              <Hospital className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">{t('facilities_modal_title')}</h2>
                <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {gpsLocation?.source === 'gps' ? 'Live GPS Detected' : 'Manual Location'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{t('facilities_modal_sub')}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
            title={t('close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location Status & Manual Selector Bar */}
        <div className="p-4 bg-slate-900/90 border-b border-white/10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-pulse" />
              <span className="text-slate-300">
                <strong>{t('your_location_label')}:</strong> <span className="text-white font-bold">{gpsLocation?.address || 'Rampur, Varanasi'}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              {/* Refresh GPS Location Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl border border-white/10 font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                title={t('refresh_gps')}
              >
                <Crosshair className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Updating...' : t('refresh_gps')}</span>
              </button>

              {/* Change / Enter Location Manually Button */}
              <button
                onClick={() => setIsManualPickerOpen(!isManualPickerOpen)}
                className="px-3 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded-xl border border-teal-500/30 font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Change Location</span>
              </button>
            </div>
          </div>

          {/* Manual Location Selection Drawer */}
          {isManualPickerOpen && (
            <div className="p-4 bg-slate-950 rounded-2xl border border-teal-500/30 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                  Select Your Village or Enter Location:
                </span>
                <button
                  onClick={() => setIsManualPickerOpen(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕ Close
                </button>
              </div>

              {/* Village Quick Select Buttons */}
              <div className="flex flex-wrap gap-2">
                {Object.keys(KNOWN_VILLAGES).map((vName) => (
                  <button
                    key={vName}
                    onClick={() => handleSelectVillage(vName)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl border border-white/10 text-xs font-medium transition-colors"
                  >
                    📍 {vName} ({KNOWN_VILLAGES[vName].district})
                  </button>
                ))}
              </div>

              {/* Custom Location Search Input */}
              <form onSubmit={handleCustomLocationSubmit} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={customInputLoc}
                  onChange={(e) => setCustomInputLoc(e.target.value)}
                  placeholder="Enter custom village, town or landmark..."
                  className="flex-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Set Location
                </button>
              </form>
            </div>
          )}

          {/* Filter Bar & Search Input */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by facility name, doctor on duty, specialty (e.g. Oxygen, ICU)..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-950/80 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-white placeholder:text-slate-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'All Facilities' },
                { id: 'hospital', label: '🏥 Hospitals' },
                { id: 'phc', label: '🏥 PHCs' },
                { id: 'clinic', label: '🩺 Clinics' },
                { id: 'ambulance', label: '🚑 Ambulances' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                      : 'bg-slate-950/60 text-slate-300 hover:text-white border border-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Facilities List (Sorted by Nearest Distance) */}
        <div className="flex-1 overflow-y-auto modal-scroll-area p-5 sm:p-6 space-y-4">
          
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
            <span>
              Showing <strong className="text-white">{filteredFacilities.length}</strong> facilities sorted by closest distance
            </span>
            <a
              href={getGoogleMapsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1 font-bold"
            >
              <span>{t('view_on_map')}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {filteredFacilities.length > 0 ? (
            <div className="space-y-4">
              {filteredFacilities.map((fac) => (
                <div
                  key={fac.id}
                  className="p-5 bg-slate-900/70 hover:bg-slate-900/90 rounded-3xl border border-white/10 shadow-lg transition-all space-y-3.5"
                >
                  {/* Top Line: Name, Badge, Distance */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-2xl bg-slate-950 border border-white/10 flex-shrink-0 mt-0.5">
                        {getCategoryIcon(fac)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-white text-base sm:text-lg">{fac.name}</h3>
                          {getCategoryBadge(fac)}
                        </div>
                        <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          {fac.address}
                        </p>
                      </div>
                    </div>

                    {/* Distance & ETA Badge */}
                    <div className="flex items-center gap-2 self-start sm:self-center text-xs font-black flex-shrink-0">
                      <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        {fac.distanceKm} km
                      </span>
                      <span className="px-3.5 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5 shadow-sm">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        ~{fac.estimatedTimeMins} mins
                      </span>
                    </div>
                  </div>

                  {/* Medical Details Row: Doctor on duty, beds, 24x7 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 bg-slate-950/80 rounded-2xl border border-white/5 text-xs text-slate-300">
                    {fac.doctorOnDuty && (
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span><strong>Doctor:</strong> {fac.doctorOnDuty}</span>
                      </div>
                    )}
                    {fac.availableBeds !== undefined && (
                      <div className="flex items-center gap-2">
                        <Bed className="w-4 h-4 text-teal-400 flex-shrink-0" />
                        <span><strong>Beds Available:</strong> {fac.availableBeds} beds</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span><strong>Status:</strong> {fac.is24x7 ? '24/7 Emergency Open' : 'Day Clinic Active'}</span>
                    </div>
                  </div>

                  {/* Specialties Badges */}
                  {fac.specialties && fac.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {fac.specialties.map((spec, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-950 text-slate-300 border border-white/5"
                        >
                          ✓ {spec}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons: Call & Get Directions */}
                  <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                    {/* Call Button */}
                    <a
                      href={`tel:${fac.phone}`}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 active:scale-95 transition-all"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call Facility ({fac.phone})</span>
                    </a>

                    {/* Get Directions Button */}
                    <a
                      href={getGoogleMapsUrl(fac.latitude, fac.longitude)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-extrabold text-xs sm:text-sm rounded-2xl border border-white/10 flex items-center gap-2 transition-colors shadow-md"
                    >
                      <Navigation className="w-4 h-4 text-cyan-400" />
                      <span>Get Directions</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 text-sm space-y-2">
              <Hospital className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="font-bold text-white">No healthcare facilities found matching your filter.</p>
              <p className="text-xs text-slate-500">Try clearing your search query or selecting "All Facilities".</p>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-4 bg-slate-950 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>National Emergency Dispatch:</span>
            <a href="tel:108" className="text-red-400 font-black hover:underline">108 (Ambulance)</a>
            <span>•</span>
            <a href="tel:104" className="text-emerald-400 font-black hover:underline">104 (Health Helpline)</a>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 border border-white/10 text-white font-bold rounded-xl self-end sm:self-center"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
