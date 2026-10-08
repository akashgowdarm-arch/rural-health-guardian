import React from 'react';
import { DistributionFlow } from '../components/DistributionFlow';
import { Truck, ShieldCheck, MapPin, Warehouse, ArrowRight, FileCheck } from 'lucide-react';

interface DistributionPageProps {
  onOpenQuote: () => void;
  onNavigateContact: () => void;
}

export const DistributionPage: React.FC<DistributionPageProps> = ({
  onOpenQuote,
  onNavigateContact,
}) => {
  return (
    <main className="flex-1 bg-white">
      {/* Hero Banner */}
      <section className="relative py-16 sm:py-24 bg-navy-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80"
            alt="Logistics & Warehousing Hub"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-solar-500/20 text-solar-400 border border-solar-500/30 text-xs font-bold uppercase tracking-wider">
            <Truck className="w-3.5 h-3.5" />
            <span>WHOLESALE SUPPLY CHAIN</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            Reliable Solar Distribution
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Connecting world-class manufacturing capacity directly with solar contractors, regional retailers, and engineering procurement firms.
          </p>
        </div>
      </section>

      {/* 6-Step Distribution Process and Pillars */}
      <DistributionFlow
        onOpenQuote={onOpenQuote}
        showPillars={true}
      />

      {/* Regional Network & Dealer Onboarding */}
      <section className="py-20 bg-slate-50/70 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-solar-600">
                DEALERSHIP ONBOARDING
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                Empowering Regional Solar Dealers
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                As an authorized SOCIO Solar Systems dealer, your organization gains priority stock allocation, volume tiered discounts, and direct warranty handling. We treat our distribution partners as the essential link to a cleaner future.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 text-sm text-slate-700">
                  <FileCheck className="w-5 h-5 text-socio-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Standardized RMA Protocols:</strong> Rapid warranty replacement on all distributed hardware.
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-700">
                  <Warehouse className="w-5 h-5 text-socio-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Local Inventory Staging:</strong> Buffer stock maintained for rapid emergency dispatch.
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-700">
                  <MapPin className="w-5 h-5 text-solar-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Coverage Boundaries:</strong> [DISTRIBUTION GEOGRAPHIES &amp; REGIONAL COVERAGE TO BE UPDATED].
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <button
                  onClick={onOpenQuote}
                  className="bg-solar-600 hover:bg-solar-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-soft transition-all"
                >
                  Apply to Become a Dealer
                </button>
                <button
                  onClick={onNavigateContact}
                  className="px-6 py-3.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors"
                >
                  Contact Logistics Team
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1548611716-ad3833d7591c?auto=format&fit=crop&w=1000&q=80"
                  alt="Solar Warehouse Logistics"
                  className="w-full h-[400px] object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
};
