import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../types';
import { Heart, ArrowRight, UserCheck, Stethoscope, Building2 } from 'lucide-react';

interface Props {
  onSwitchToRegister: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<Props> = ({ onSwitchToRegister, onLoginSuccess }) => {
  const { login, switchUser } = useAuth();
  const { t } = useLanguage();

  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [phone, setPhone] = useState('98765 43210');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(phone, selectedRole);
    onLoginSuccess();
  };

  const quickLogins = [
    { label: t('demo_patient_normal'), id: 'user_ramesh', role: 'patient' as const, phone: '98765 43210', note: t('demo_patient_normal_sub') },
    { label: t('demo_patient_attention'), id: 'user_gangamma', role: 'patient' as const, phone: '94481 23456', note: t('demo_patient_attention_sub') },
    { label: t('demo_patient_emergency'), id: 'user_rajesh', role: 'patient' as const, phone: '98250 11223', note: t('demo_patient_emergency_sub') },
    { label: t('demo_worker'), id: 'worker_sunita', role: 'worker' as const, phone: '97110 55443', note: t('demo_worker_sub') },
    { label: t('demo_admin'), id: 'admin_sharma', role: 'admin' as const, phone: '98100 99887', note: t('demo_admin_sub') },
  ];

  return (
    <div className="w-full max-w-md p-4">
      <div className="gamma-card rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-emerald-500/30">
            <Heart className="w-8 h-8 fill-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">{t('app_name')}</h1>
          <p className="text-xs text-slate-400 font-medium">{t('tagline')}</p>
        </div>

        {/* Role Picker */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
            {t('auth_select_role')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'patient' as const, label: t('role_patient').split('/')[0].trim(), icon: <UserCheck className="w-4 h-4" /> },
              { id: 'worker' as const, label: 'ASHA', icon: <Stethoscope className="w-4 h-4" /> },
              { id: 'admin' as const, label: 'Admin', icon: <Building2 className="w-4 h-4" /> },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRole(r.id)}
                className={`py-3 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  selectedRole === r.id
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 ring-2 ring-emerald-400/40 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900/80 text-slate-400 border-white/10 hover:bg-slate-800'
                }`}
              >
                {r.icon}
                <span className="text-[11px]">{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Phone Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              {t('auth_phone_label')}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-xs font-bold text-slate-500">+91</span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('auth_phone_placeholder')}
                className="w-full pl-12 pr-4 py-2.5 text-sm font-bold bg-slate-900/90 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white placeholder:text-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 border border-emerald-400/30"
          >
            <span>{t('nav_login')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Quick Demo Login Shortcuts */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            {t('auth_instant_demo_title')}
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {quickLogins.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  switchUser(q.id);
                  onLoginSuccess();
                }}
                className="w-full p-2.5 rounded-xl bg-slate-900/80 hover:bg-emerald-950/40 border border-white/10 hover:border-emerald-500/40 text-left text-xs transition-colors flex items-center justify-between group"
              >
                <div>
                  <p className="font-bold text-white group-hover:text-emerald-300">{q.label}</p>
                  <p className="text-[10px] text-slate-400">{q.note}</p>
                </div>
                <span className="text-[10px] text-emerald-400 font-black group-hover:translate-x-0.5 transition-transform">
                  {t('auth_login_arrow')}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Switch to Register */}
        <div className="text-center pt-1 text-xs text-slate-400">
          {t('auth_new_user_prompt')}{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-bold text-emerald-400 hover:underline"
          >
            {t('auth_register_link')}
          </button>
        </div>
      </div>
    </div>
  );
};
