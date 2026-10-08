import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNetwork } from '../../context/NetworkContext';
import { LanguageCode } from '../../types';
import {
  Settings,
  Globe,
  Volume2,
  Database,
  Check,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { DisclaimerBanner } from '../common/DisclaimerBanner';

export const SettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { pendingSyncCount, triggerSync, isSyncing } = useNetwork();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [autoVoice, setAutoVoice] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in text-slate-100">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">{t('settings_title')}</h1>
          <p className="text-xs text-slate-400">{t('settings_sub')}</p>
        </div>
      </div>

      <DisclaimerBanner compact />

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-500/20 text-emerald-200 rounded-2xl flex items-center gap-2 border border-emerald-500/40 font-bold text-xs animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{t('settings_saved_toast')}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* 1. Language & Speech */}
        <div className="gamma-card p-5 sm:p-7 rounded-3xl border border-white/10 shadow-2xl space-y-4">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>{t('settings_lang_section')}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { code: 'en' as LanguageCode, label: 'English', sub: 'Default' },
              { code: 'hi' as LanguageCode, label: 'हिंदी (Hindi)', sub: 'भारत सरकार' },
              { code: 'kn' as LanguageCode, label: 'ಕನ್ನಡ (Kannada)', sub: 'ಕರ್ನಾಟಕ' },
            ].map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLanguage(l.code)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  language === l.code
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-white ring-2 ring-emerald-400/40 font-bold shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900/80 border-white/10 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{l.label}</span>
                  {language === l.code && <span className="text-emerald-400 font-bold text-xs">✓</span>}
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5">{l.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Accessibility & Voice Assistance */}
        <div className="gamma-card p-5 sm:p-7 rounded-3xl border border-white/10 shadow-2xl space-y-4">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>{t('settings_accessibility_section')}</span>
          </h2>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-2xl border border-white/10 cursor-pointer hover:bg-slate-800 transition-colors">
              <div>
                <span className="text-xs font-bold text-white block">{t('settings_auto_voice_label')}</span>
                <span className="text-[11px] text-slate-400">{t('settings_auto_voice_sub')}</span>
              </div>
              <input
                type="checkbox"
                checked={autoVoice}
                onChange={(e) => setAutoVoice(e.target.checked)}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-2xl border border-white/10 cursor-pointer hover:bg-slate-800 transition-colors">
              <div>
                <span className="text-xs font-bold text-white block">{t('settings_large_text_label')}</span>
                <span className="text-[11px] text-slate-400">{t('settings_large_text_sub')}</span>
              </div>
              <input
                type="checkbox"
                checked={largeText}
                onChange={(e) => setLargeText(e.target.checked)}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </label>
          </div>
        </div>

        {/* 3. Village Profile & Emergency Contact */}
        <div className="gamma-card p-5 sm:p-7 rounded-3xl border border-white/10 shadow-2xl space-y-4">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-400" />
            <span>{t('settings_emergency_section')}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">{t('settings_assigned_village')}</label>
              <input
                type="text"
                defaultValue={currentUser.village}
                className="w-full px-3 py-2 bg-slate-900/90 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">{t('settings_primary_contact')}</label>
              <input
                type="text"
                defaultValue={`${currentUser.emergency_contact.name} (${currentUser.emergency_contact.phone})`}
                className="w-full px-3 py-2 bg-slate-900/90 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-white"
              />
            </div>
          </div>
        </div>

        {/* 4. Offline Storage & Local Cache */}
        <div className="gamma-card p-5 sm:p-7 rounded-3xl border border-white/10 shadow-2xl space-y-4">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-400" />
            <span>{t('settings_cache_section')}</span>
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-900/80 rounded-2xl border border-white/10">
            <div>
              <span className="text-xs font-bold text-white block">{t('settings_pending_queue')}</span>
              <span className="text-xs text-slate-400">{pendingSyncCount} {t('sync_pending')}</span>
            </div>

            <button
              type="button"
              onClick={triggerSync}
              disabled={pendingSyncCount === 0 || isSyncing}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? t('sync_syncing') : t('sync_local_data_btn')}</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 border border-emerald-400/30"
        >
          <Check className="w-4 h-4" />
          <span>{t('settings_save_btn')}</span>
        </button>
      </form>
    </div>
  );
};
