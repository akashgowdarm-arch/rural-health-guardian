import React from 'react';
import { DISTRIBUTION_STEPS, DISTRIBUTION_PILLARS, DistributionStep } from '../data/distribution';
import { Search, CheckCircle2, Warehouse, Truck, Users, UserCheck, ArrowRight } from 'lucide-react';

interface DistributionFlowProps {
  onExploreMore?: () => void;
  onOpenQuote?: () => void;
  showPillars?: boolean;
}

export const DistributionFlow: React.FC<DistributionFlowProps> = ({
  onExploreMore,
  onOpenQuote,
  showPillars = true,
}) => {
  const getStepIcon = (iconName: DistributionStep['iconName']) => {
    switch (iconName) {
      case 'Search':
        return <Search className="w-5 h-5 text-socio-600" />;
      case 'CheckCircle2':
        return <CheckCircle2 className="w-5 h-5 text-socio-600" />;
      case 'Warehouse':
        return <Warehouse className="w-5 h-5 text-socio-600" />;
      case 'Truck':
        return <Truck className="w-5 h-5 text-solar-500" />;
      case 'Users':
        return <Users className="w-5 h-5 text-socio-600" />;
      case 'UserCheck':
        return <UserCheck className="w-5 h-5 text-solar-500" />;
      default:
        return <Truck className="w-5 h-5 text-socio-600" />;
    }
  };

  return (
    <section className="py-20 sm:py-24 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-socio-50 border border-socio-200 text-socio-700 text-xs font-bold uppercase tracking-wider mb-3">
            SUPPLY CHAIN ARCHITECTURE
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Reliable Solar Distribution
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed">
            Our systematic 6-tier distribution lifecycle ensures authentic hardware provenance, rigorous batch validation, and dependable delivery to job sites.
          </p>
        </div>

        {/* Desktop Process: Visually Attractive Horizontal Flow */}
        <div className="hidden lg:block relative my-12">
          {/* Connecting Line behind nodes */}
          <div className="absolute top-1/2 left-8 right-8 h-1 bg-gradient-to-r from-socio-600 via-solar-500 to-socio-600 -translate-y-1/2 z-0 rounded-full opacity-60" />

          <div className="grid grid-cols-6 gap-4 relative z-10">
            {DISTRIBUTION_STEPS.map((step, index) => (
              <div
                key={step.stepNumber}
                className="flex flex-col items-center text-center group"
              >
                {/* Step Circle Node */}
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-socio-600 shadow-md group-hover:border-solar-500 group-hover:scale-110 transition-all duration-300 flex items-center justify-center relative mb-4">
                  {getStepIcon(step.iconName)}
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-solar-500 text-white text-xs font-black flex items-center justify-center shadow-sm">
                    {step.stepNumber}
                  </span>
                </div>

                {/* Step Title */}
                <h3 className="text-xs font-black text-slate-900 group-hover:text-socio-600 uppercase tracking-wider transition-colors">
                  {step.title}
                </h3>
                
                {/* Description tooltip on hover */}
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed line-clamp-3">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile & Tablet Process: Vertical Timeline */}
        <div className="block lg:hidden relative pl-6 sm:pl-8 space-y-8 my-8 border-l-2 border-socio-600/40 ml-4 sm:ml-6">
          {DISTRIBUTION_STEPS.map((step) => (
            <div key={step.stepNumber} className="relative group">
              {/* Timeline marker */}
              <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-10 h-10 rounded-xl bg-white border-2 border-socio-600 shadow-sm flex items-center justify-center">
                <span className="text-xs font-extrabold text-solar-600">
                  0{step.stepNumber}
                </span>
              </div>

              {/* Timeline Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-socio-50/40 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  {getStepIcon(step.iconName)}
                  <h3 className="text-sm font-bold text-slate-900 uppercase">
                    {step.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Distribution Pillars & Capabilities */}
        {showPillars && (
          <div className="mt-16 pt-16 border-t border-slate-100">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold text-slate-900">
                Core Distribution Capabilities
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Ensuring smooth trade logistics, credit facilities, and technical integration.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {DISTRIBUTION_PILLARS.map((pillar, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-socio-400 transition-all flex flex-col justify-between"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-2">
                      {pillar.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                  {pillar.placeholderNotice && (
                    <div className="mt-3 text-[10px] font-semibold text-solar-600 bg-solar-50 px-2 py-1 rounded">
                      {pillar.placeholderNotice}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-12 text-center flex flex-wrap items-center justify-center gap-4">
              {onOpenQuote && (
                <button
                  onClick={onOpenQuote}
                  className="inline-flex items-center gap-2 bg-solar-600 hover:bg-solar-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-soft transition-all transform hover:-translate-y-0.5"
                >
                  <span>Apply for Dealer Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {onExploreMore && (
                <button
                  onClick={onExploreMore}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-socio-600 hover:text-socio-800 px-4 py-3"
                >
                  <span>View Full Distribution Program</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
