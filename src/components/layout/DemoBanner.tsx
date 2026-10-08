import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sparkles, UserCheck, ShieldAlert, HeartPulse, Stethoscope, Building2 } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { currentUser, switchUser, switchRole } = useAuth();
  const { t } = useLanguage();

  const demoPersonas = [
    {
      id: 'user_ramesh',
      name: t('demo_patient_normal'),
      sub: t('demo_patient_normal_sub'),
      role: 'patient' as const,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100',
      activeColor: 'bg-emerald-600 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-400',
      icon: <HeartPulse className="w-3.5 h-3.5" />,
    },
    {
      id: 'user_gangamma',
      name: t('demo_patient_attention'),
      sub: t('demo_patient_attention_sub'),
      role: 'patient' as const,
      color: 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100',
      activeColor: 'bg-amber-600 text-white border-amber-700 shadow-sm ring-2 ring-amber-400',
      icon: <UserCheck className="w-3.5 h-3.5" />,
    },
    {
      id: 'user_rajesh',
      name: t('demo_patient_emergency'),
      sub: t('demo_patient_emergency_sub'),
      role: 'patient' as const,
      color: 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100',
      activeColor: 'bg-red-600 text-white border-red-700 shadow-sm ring-2 ring-red-400 animate-pulse',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
    },
    {
      id: 'worker_sunita',
      name: t('demo_worker'),
      sub: t('demo_worker_sub'),
      role: 'worker' as const,
      color: 'bg-teal-50 text-teal-800 border-teal-300 hover:bg-teal-100',
      activeColor: 'bg-teal-700 text-white border-teal-800 shadow-sm ring-2 ring-teal-400',
      icon: <Stethoscope className="w-3.5 h-3.5" />,
    },
    {
      id: 'admin_sharma',
      name: t('demo_admin'),
      sub: t('demo_admin_sub'),
      role: 'admin' as const,
      color: 'bg-indigo-50 text-indigo-800 border-indigo-300 hover:bg-indigo-100',
      activeColor: 'bg-indigo-700 text-white border-indigo-800 shadow-sm ring-2 ring-indigo-400',
      icon: <Building2 className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="bg-slate-900 text-white py-2 px-3 sm:px-6 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-amber-500/20 text-amber-400 rounded">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            {t('demo_switcher_title')}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {demoPersonas.map((p) => {
            const isActive = currentUser.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  switchUser(p.id);
                  switchRole(p.role);
                }}
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap font-medium ${
                  isActive ? p.activeColor : p.color
                }`}
                title={p.sub}
              >
                {p.icon}
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
