import React from 'react';
import { PARTNERS_DATA } from '../data/partners';
import { ShieldCheck, Sparkles } from 'lucide-react';

export const Partners: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-slate-50/50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/70 text-slate-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-solar-500" />
            <span>OEM &amp; HARDWARE ALLIANCES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Global Brands We Work With
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Procuring strictly authenticated, warrantied products from verified global technology manufacturers.
          </p>
        </div>

        {/* Clean Partner Placeholder Blocks Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {PARTNERS_DATA.map((partner) => (
            <div
              key={partner.id}
              className="group p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-soft hover:border-socio-400 transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[110px]"
            >
              {/* Partner Logo Slot */}
              <div className="w-full py-2.5 px-3 rounded-lg bg-slate-100/80 group-hover:bg-socio-50/60 border border-dashed border-slate-300 group-hover:border-socio-300 transition-colors flex flex-col items-center justify-center">
                <span className="text-[11px] font-black tracking-wider text-slate-700 group-hover:text-socio-700 uppercase">
                  {partner.name}
                </span>
                <span className="text-[9px] font-semibold text-slate-400 mt-0.5 tracking-widest uppercase">
                  {partner.logoPlaceholder}
                </span>
              </div>

              {/* Hardware Category */}
              <span className="text-[10px] font-medium text-slate-500 mt-2 truncate w-full">
                {partner.category}
              </span>
            </div>
          ))}
        </div>

        {/* Notice of compliance */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-slate-400 bg-white px-4 py-1.5 rounded-full border border-slate-200/60 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-socio-600" />
            <span>Official manufacturer authorizations and datasheets available upon commercial agreement.</span>
          </div>
        </div>

      </div>
    </section>
  );
};
