import React from 'react';
import { ShieldCheck, Truck, Leaf } from 'lucide-react';

export const TrustPoints: React.FC = () => {
  const points = [
    {
      icon: ShieldCheck,
      title: 'Reliable Products',
      desc: 'Quality-tested tier-1 equipment',
    },
    {
      icon: Truck,
      title: 'Trusted Distribution',
      desc: 'Synchronized logistics & supply',
    },
    {
      icon: Leaf,
      title: 'A Greener Tomorrow',
      desc: '100% sustainable commitment',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
      {points.map((pt, idx) => {
        const Icon = pt.icon;
        return (
          <div
            key={idx}
            className="flex items-center gap-3 p-2 rounded-xl transition-all duration-200 hover:bg-socio-50/50"
          >
            <div className="w-10 h-10 rounded-xl bg-socio-50 text-socio-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-socio-100">
              <Icon className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                {pt.title}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {pt.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
