import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../types';
import { UserCheck, Stethoscope, ArrowLeft, Check } from 'lucide-react';

interface Props {
  onSwitchToLogin: () => void;
  onRegisterSuccess: () => void;
}

export const RegisterPage: React.FC<Props> = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const { register } = useAuth();
  const { t } = useLanguage();

  const [role, setRole] = useState<UserRole>('patient');
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(38);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  const [village, setVillage] = useState('Rampur');
  const [district, setDistrict] = useState('Varanasi');
  const [state, setState] = useState('Uttar Pradesh');
  const [phone, setPhone] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('Spouse');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    register({
      name: name.trim(),
      age: Number(age),
      gender,
      village: village.trim(),
      district: district.trim(),
      state: state.trim(),
      phone: phone.trim(),
      role,
      emergency_contact: {
        name: emergencyName.trim() || 'Family Member',
        relationship: emergencyRel,
        phone: emergencyPhone.trim() || '+91 99999 88888',
      },
    });

    onRegisterSuccess();
  };

  return (
    <div className="w-full max-w-lg p-4 py-8">
      <div className="gamma-card rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
        <button
          onClick={onSwitchToLogin}
          className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('auth_back_to_login')}</span>
        </button>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-white tracking-tight">{t('auth_create_account_title')}</h1>
          <p className="text-xs text-slate-400 font-medium">{t('auth_create_account_sub')}</p>
        </div>

        {/* Role Toggle */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRole('patient')}
            className={`py-3 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              role === 'patient'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 ring-2 ring-emerald-400/40 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-900/80 text-slate-400 border-white/10 hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{t('role_patient')}</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('worker')}
            className={`py-3 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              role === 'worker'
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 ring-2 ring-teal-400/40 shadow-lg shadow-teal-500/10'
                : 'bg-slate-900/80 text-slate-400 border-white/10 hover:bg-slate-800'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>{t('role_worker')}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Name, Age, Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">{t('auth_full_name')}</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3 py-2 text-sm bg-slate-900/90 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white placeholder:text-slate-600"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">{t('auth_age')}</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-900/90 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white"
              />
            </div>
          </div>

          {/* Gender & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">{t('auth_gender')}</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-slate-900/90 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white"
              >
                <option value="male" className="bg-slate-900 text-white">{t('auth_gender_male')}</option>
                <option value="female" className="bg-slate-900 text-white">{t('auth_gender_female')}</option>
                <option value="other" className="bg-slate-900 text-white">{t('auth_gender_other')}</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">{t('auth_phone_label')} *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full px-3 py-2 text-sm bg-slate-900/90 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Village, District, State */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">{t('auth_village')}</label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="Rampur"
                className="w-full px-3 py-2 text-sm bg-slate-900/90 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">{t('auth_district')}</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Varanasi"
                className="w-full px-3 py-2 text-sm bg-slate-900/90 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">{t('auth_state')}</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Uttar Pradesh"
                className="w-full px-3 py-2 text-sm bg-slate-900/90 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="p-4 bg-slate-900/80 rounded-2xl border border-white/10 space-y-2.5">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] block">
              {t('auth_emergency_contact_header')}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder={t('auth_emergency_name_ph')}
                className="w-full px-3 py-2 text-xs bg-slate-950/90 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white placeholder:text-slate-600"
              />
              <input
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder={t('auth_emergency_phone_ph')}
                className="w-full px-3 py-2 text-xs bg-slate-950/90 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white placeholder:text-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 border border-emerald-400/30"
          >
            <Check className="w-4 h-4" />
            <span>{t('auth_complete_register_btn')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
