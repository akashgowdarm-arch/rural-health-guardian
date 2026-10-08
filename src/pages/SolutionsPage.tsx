import React from 'react';
import { SOLAR_SOLUTIONS } from '../data/solutions';
import { Home, Building2, Factory, Wrench, CheckCircle2, ArrowRight, Sun } from 'lucide-react';

interface SolutionsPageProps {
  onOpenQuote: () => void;
  onNavigateContact: () => void;
}

export const SolutionsPage: React.FC<SolutionsPageProps> = ({
  onOpenQuote,
  onNavigateContact,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home':
        return <Home className="w-6 h-6 text-socio-600" />;
      case 'Building2':
        return <Building2 className="w-6 h-6 text-socio-600" />;
      case 'Factory':
        return <Factory className="w-6 h-6 text-socio-600" />;
      case 'Wrench':
        return <Wrench className="w-6 h-6 text-solar-500" />;
      default:
        return <Home className="w-6 h-6 text-socio-600" />;
    }
  };

  return (
    <main className="flex-1 bg-white">
      {/* Header Banner */}
      <section className="relative py-16 sm:py-24 bg-navy-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=1600&q=80"
            alt="Solar installation solutions"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-solar-500/20 text-solar-400 border border-solar-500/30 text-xs font-bold uppercase tracking-wider">
            <Sun className="w-3.5 h-3.5" />
            <span>SOLAR SOLUTIONS</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            Solutions for Every Energy Need
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Tailored hardware configurations and distribution supply packages engineered for distinct operational requirements.
          </p>
        </div>
      </section>

      {/* Solutions Detailed List */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {SOLAR_SOLUTIONS.map((sol, index) => {
          const isEven = index % 2 === 1;
          return (
            <div
              key={sol.id}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center ${
                isEven ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Image Side */}
              <div className={`lg:col-span-6 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 group">
                  <img
                    src={sol.image}
                    alt={sol.title}
                    className="w-full h-[380px] object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 w-12 h-12 rounded-2xl bg-white/95 backdrop-blur-md shadow-md flex items-center justify-center">
                    {getIcon(sol.iconName)}
                  </div>
                </div>
              </div>

              {/* Text Content Side */}
              <div className={`lg:col-span-6 space-y-6 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-solar-600">
                    {sol.subtitle}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                    {sol.title}
                  </h2>
                </div>

                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                  {sol.fullDetails}
                </p>

                <div className="space-y-2.5 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Key Advantages:
                  </h4>
                  {sol.benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-solar-500 flex-shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <button
                    onClick={onOpenQuote}
                    className="inline-flex items-center gap-2 bg-solar-600 hover:bg-solar-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-soft hover:shadow-orange-glow transition-all"
                  >
                    <span>Request System Proposal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-navy-950 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Custom Engineering &amp; Bill of Materials
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Have a project layout or single-line diagram ready? Send it to our technical desk for complete BOM staging and quotation.
          </p>
          <div className="pt-2">
            <button
              onClick={onNavigateContact}
              className="bg-solar-600 hover:bg-solar-700 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-soft transition-all"
            >
              Contact Engineering Desk
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};
