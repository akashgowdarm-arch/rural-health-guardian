import React from 'react';
import { SOLAR_SOLUTIONS, SolarSolution } from '../data/solutions';
import { Home, Building2, Factory, Wrench, ArrowRight } from 'lucide-react';

interface SolutionsProps {
  onSelectSolution?: (solution: SolarSolution) => void;
  onOpenQuote?: () => void;
}

export const Solutions: React.FC<SolutionsProps> = ({ onSelectSolution, onOpenQuote }) => {
  const getIcon = (iconName: SolarSolution['iconName']) => {
    switch (iconName) {
      case 'Home':
        return <Home className="w-6 h-6 text-socio-600 stroke-[2]" />;
      case 'Building2':
        return <Building2 className="w-6 h-6 text-socio-600 stroke-[2]" />;
      case 'Factory':
        return <Factory className="w-6 h-6 text-socio-600 stroke-[2]" />;
      case 'Wrench':
        return <Wrench className="w-6 h-6 text-solar-500 stroke-[2]" />;
      default:
        return <Home className="w-6 h-6 text-socio-600 stroke-[2]" />;
    }
  };

  return (
    <section className="py-20 sm:py-24 bg-slate-50/70 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-solar-50 border border-solar-200 text-solar-700 text-xs font-bold uppercase tracking-wider mb-3">
            SOLAR SOLUTIONS
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Solutions for Every Energy Need
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed">
            From self-sufficient residential rooftops to multi-megawatt industrial microgrids and professional EPC supply chains.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {SOLAR_SOLUTIONS.map((solution) => (
            <div
              key={solution.id}
              className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-soft hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-2 flex flex-col justify-between"
            >
              {/* Image with Dark Gradient Sheen */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                <img
                  src={solution.image}
                  alt={solution.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/20 to-transparent" />
                
                {/* Floating Icon */}
                <div className="absolute top-4 left-4 w-12 h-12 rounded-xl bg-white/95 backdrop-blur-md shadow-md flex items-center justify-center border border-white/40 group-hover:scale-110 transition-transform">
                  {getIcon(solution.iconName)}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-socio-600 transition-colors leading-tight">
                    {solution.title}
                  </h3>
                  <p className="text-xs font-semibold text-solar-600 mt-1">
                    {solution.subtitle}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                    {solution.description}
                  </p>
                </div>

                {/* Learn More & Quote Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (onSelectSolution) onSelectSolution(solution);
                      else if (onOpenQuote) onOpenQuote();
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-socio-600 hover:text-solar-600 transition-colors py-1 group/btn"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={onOpenQuote}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-900 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Enquire
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
