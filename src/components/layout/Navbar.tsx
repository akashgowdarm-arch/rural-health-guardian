import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNetwork, NetworkStatus } from '../../context/NetworkContext';
import { useHealth } from '../../context/HealthContext';
import { useLocation } from '../../context/LocationContext';
import { LanguageCode } from '../../types';
import { NearbyHealthcareSearchModal } from '../location/NearbyHealthcareSearchModal';
import {
  Heart,
  Activity,
  History,
  ShieldAlert,
  Bot,
  Users,
  Building,
  Settings,
  Globe,
  Wifi,
  WifiOff,
  RefreshCw,
  Menu,
  X,
  ChevronDown,
  MapPin,
  Crosshair,
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSOS: () => void;
  onOpenNewReading: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onOpenSOS,
  onOpenNewReading,
}) => {
  const { currentUser, role } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { status: networkStatus, setStatus: setNetworkStatus, pendingSyncCount, triggerSync, isSyncing } = useNetwork();
  const { activeEmergencyCount } = useHealth();
  const { gpsLocation, nearestPHC, permissionStatus, requestLocation, setShowPermissionModal } = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isNearestModalOpen, setIsNearestModalOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: t('nav_dashboard'), icon: <Activity className="w-4 h-4" />, roles: ['patient'] },
    { id: 'history', label: t('nav_health_history'), icon: <History className="w-4 h-4" />, roles: ['patient'] },
    { id: 'assistant', label: t('nav_ai_assistant'), icon: <Bot className="w-4 h-4" />, roles: ['patient', 'worker', 'admin'] },
    { id: 'worker', label: t('nav_healthcare_worker'), icon: <Users className="w-4 h-4" />, badge: activeEmergencyCount > 0 ? activeEmergencyCount : undefined, roles: ['worker', 'admin'] },
    { id: 'village', label: t('nav_village_overview'), icon: <Building className="w-4 h-4" />, roles: ['worker', 'admin'] },
    { id: 'settings', label: t('nav_settings'), icon: <Settings className="w-4 h-4" />, roles: ['patient', 'worker', 'admin'] },
  ];

  const visibleNavItems = navItems.filter(item => item.roles.includes(role));

  const languages = [
    { code: 'en' as LanguageCode, label: 'English' },
    { code: 'hi' as LanguageCode, label: 'हिंदी (Hindi)' },
    { code: 'kn' as LanguageCode, label: 'ಕನ್ನಡ (Kannada)' },
  ];

  return (
    <header className="bg-slate-950/70 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-40 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab(role === 'patient' ? 'dashboard' : 'worker')}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl text-white tracking-tight leading-none">
                  {t('app_name')}
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {t('govt_sub_tag')}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                {t('tagline')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-900/60 rounded-2xl border border-white/5 backdrop-blur-md">
            {visibleNavItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/25 border border-emerald-400/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-red-600 text-white font-black animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick SOS Trigger Button in Header */}
            <button
              onClick={onOpenSOS}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-red-600/30 hover:from-red-700 hover:to-rose-800 active:scale-95 transition-all border border-red-400/30 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 animate-bounce" />
              <span>SOS</span>
            </button>

            {/* Live GPS Location Button */}
            <button
              onClick={() => {
                if (permissionStatus === 'granted') {
                  setIsNearestModalOpen(true);
                } else {
                  setShowPermissionModal(true);
                }
              }}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all backdrop-blur-md cursor-pointer ${
                permissionStatus === 'granted'
                  ? 'bg-teal-500/15 text-teal-300 border-teal-500/30 hover:bg-teal-500/25'
                  : 'bg-slate-900/80 text-slate-300 border-white/10 hover:bg-slate-800 hover:text-white'
              }`}
              title={permissionStatus === 'granted' ? 'View Nearest Healthcare Facilities' : 'Click to Enable GPS Location'}
            >
              <MapPin className={`w-4 h-4 ${permissionStatus === 'granted' ? 'text-teal-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">
                {permissionStatus === 'granted'
                  ? `${nearestPHC?.distanceKm || 2.4} km to PHC`
                  : t('gps_enable_btn_nav')}
              </span>
            </button>

            {/* Network / Offline Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
                className={`p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all backdrop-blur-md ${
                  networkStatus === 'online'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-xs'
                    : networkStatus === 'slow'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-xs'
                    : 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                }`}
                title={t('network_simulate_title')}
              >
                {networkStatus === 'offline' ? (
                  <WifiOff className="w-4 h-4 text-red-400" />
                ) : (
                  <Wifi className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {networkStatus === 'online' ? t('network_online') : networkStatus === 'slow' ? t('network_slow') : t('network_offline')}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {isNetworkDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 p-2 z-50 animate-fade-in">
                  <div className="text-[11px] font-bold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
                    {t('network_simulate_title')}
                  </div>
                  {(['online', 'slow', 'offline'] as NetworkStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        setNetworkStatus(st);
                        setIsNetworkDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                        networkStatus === st ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <span>
                        {st === 'online' ? t('network_4g_label') : st === 'slow' ? t('network_2g_label') : t('network_offline_label')}
                      </span>
                      {networkStatus === st && <span className="text-emerald-400 font-bold">✓</span>}
                    </button>
                  ))}

                  {pendingSyncCount > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-800 px-2">
                      <div className="text-xs text-amber-300 mb-2 font-medium">
                        {pendingSyncCount} {t('sync_pending')}
                      </div>
                      <button
                        onClick={() => {
                          triggerSync();
                          setIsNetworkDropdownOpen(false);
                        }}
                        disabled={networkStatus === 'offline' || isSyncing}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span>{isSyncing ? t('sync_syncing') : t('sync_now')}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="p-2 sm:px-3 sm:py-2 rounded-xl border border-white/10 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors backdrop-blur-md"
                title={t('language')}
              >
                <Globe className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">
                  {languages.find(l => l.code === language)?.label.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 p-2 z-50 animate-fade-in">
                  <div className="text-[11px] font-bold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
                    {t('language')}
                  </div>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                        language === l.code ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <span>{l.label}</span>
                      {language === l.code && <span className="text-emerald-400 font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile Mini Badge */}
            <div className="hidden md:flex items-center gap-2.5 pl-2.5 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-emerald-500/20">
                {currentUser.name[0]}
              </div>
              <div className="text-left leading-tight">
                <p className="text-xs font-bold text-white truncate max-w-[110px]">{currentUser.name}</p>
                <p className="text-[10px] text-emerald-400 font-semibold">{currentUser.village}</p>
              </div>
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:bg-white/5 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 backdrop-blur-2xl border-b border-white/10 px-4 pt-2 pb-6 space-y-2">
          <div className="p-3 bg-slate-900/80 rounded-2xl mb-3 flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                {currentUser.name[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{currentUser.name}</p>
                <p className="text-xs text-slate-400">{currentUser.village}, {currentUser.district}</p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 capitalize">
              {role === 'patient' ? t('role_patient') : role === 'worker' ? t('role_worker') : t('role_admin')}
            </span>
          </div>

          <div className="space-y-1">
            {visibleNavItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/25'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-red-600 text-white font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Nearest Facilities & Help Modal */}
      <NearbyHealthcareSearchModal
        isOpen={isNearestModalOpen}
        onClose={() => setIsNearestModalOpen(false)}
      />
    </header>
  );
};
