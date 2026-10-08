import React, { useState, useEffect } from 'react';
import { Check, ShieldCheck, Award, ArrowRight } from 'lucide-react';

interface WhyChooseProps {
  onLearnMore?: () => void;
  onOpenQuote?: () => void;
}

export const WhyChoose: React.FC<WhyChooseProps> = ({ onLearnMore, onOpenQuote }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const points = [
    {
      title: 'High-quality & certified products',
      note: 'Certified products subject to vendor specifications & testing standards.',
    },
    {
      title: 'Wide distribution network',
      note: 'Strategic staging and logistics for dependable on-site delivery.',
    },
    {
      title: 'Competitive pricing',
      note: 'Direct procurement benefits passed on to dealers and installers.',
    },
    {
      title: 'Technical support & training',
      note: 'Dedicated engineering support, BOM sizing, and system consultation.',
    },
    {
      title: 'Commitment to a sustainable future',
      note: 'Accelerating clean energy transition with reliable technology.',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-navy-900 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        {/* Left Column: Deep Blue Background & Verified Benefits */}
        <div className="lg:col-span-6 xl:col-span-7 px-6 sm:px-12 lg:px-16 py-16 lg:py-24 flex flex-col justify-center bg-gradient-to-br from-[#070F23] via-[#0B1B3D] to-socio-900 z-10">
          <div className="max-w-xl space-y-8">
            
            <div>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-solar-500">
                DISTRIBUTION ADVANTAGE
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-2 leading-tight">
                Why Choose SOCIO?
              </h2>
              <div className="w-16 h-1 bg-solar-500 rounded-full mt-4" />
            </div>

            <div className="space-y-5">
              {points.map((pt, idx) => (
                <div key={idx} className="flex items-start gap-4 group">
                  <div className="w-7 h-7 rounded-lg bg-solar-600/20 border border-solar-500/40 text-solar-400 flex items-center justify-center flex-shrink-0 mt-1 transition-all group-hover:bg-solar-500 group-hover:text-white">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-solar-400 transition-colors">
                      {pt.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-0.5 leading-relaxed">
                      {pt.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              {onOpenQuote && (
                <button
                  onClick={onOpenQuote}
                  className="inline-flex items-center gap-2 bg-solar-600 hover:bg-solar-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-solar-600/30 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Become a Partner</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {onLearnMore && (
                <button
                  onClick={onLearnMore}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white px-4 py-3 rounded-xl border border-white/10 hover:border-white/30 transition-colors"
                >
                  <span>Learn About Distribution</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Professional Solar Photograph with Subtle Parallax */}
        <div className="lg:col-span-6 xl:col-span-5 relative min-h-[360px] lg:min-h-full overflow-hidden bg-slate-900">
          <div
            style={{
              transform: `translateY(${Math.min(scrollY * 0.04, 50)}px)`,
              transition: 'transform 0.1s ease-out',
            }}
            className="absolute inset-0 w-full h-[120%]"
          >
            <img
              src="https://images.unsplash.com/photo-1548611716-ad3833d7591c?auto=format&fit=crop&w=1200&q=80"
              alt="Professional Solar Installation Engineer"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Subtle dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#070F23] via-transparent to-transparent lg:block hidden" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070F23] via-transparent to-transparent lg:hidden block" />

          {/* Floating Trust Card Badge */}
          <div className="absolute bottom-8 right-8 left-8 sm:left-auto max-w-sm p-5 rounded-2xl glass-panel-dark border border-white/15 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-solar-500 text-white flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Direct Distribution Chain</h4>
                <p className="text-xs text-slate-300">Transparent sourcing and dependable SLA guarantees.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
