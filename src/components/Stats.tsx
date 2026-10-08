import React, { useState, useEffect, useRef } from 'react';
import { STATS_DATA } from '../data/stats';
import { Building2, Globe2, CheckCircle2, SunMedium } from 'lucide-react';

export const Stats: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState<{ [key: string]: number }>({
    dealers: 0,
    brands: 0,
    projects: 0,
    commitment: 0,
  });

  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Smooth counter animation
  useEffect(() => {
    if (!isVisible) return;

    const duration = 1600; // ms
    const startTime = performance.now();

    const animateCount = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      setCounts({
        dealers: Math.floor(easeProgress * 500),
        brands: Math.floor(easeProgress * 10),
        projects: Math.floor(easeProgress * 1000),
        commitment: Math.floor(easeProgress * 100),
      });

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        setCounts({
          dealers: 500,
          brands: 10,
          projects: 1000,
          commitment: 100,
        });
      }
    };

    requestAnimationFrame(animateCount);
  }, [isVisible]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building':
        return <Building2 className="w-7 h-7 text-socio-600 stroke-[1.8]" />;
      case 'Globe':
        return <Globe2 className="w-7 h-7 text-socio-600 stroke-[1.8]" />;
      case 'CheckCircle':
        return <CheckCircle2 className="w-7 h-7 text-socio-600 stroke-[1.8]" />;
      case 'Sun':
        return <SunMedium className="w-7 h-7 text-solar-500 stroke-[1.8]" />;
      default:
        return <CheckCircle2 className="w-7 h-7 text-socio-600 stroke-[1.8]" />;
    }
  };

  return (
    <section ref={sectionRef} className="py-20 bg-white border-b border-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header note */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-solar-600">
            MEASURABLE SCALE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            Trusted Distribution Metrics
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Operational milestones reflecting our distribution capabilities and industry partners.
          </p>
        </div>

        {/* 4 Stats Cards in Responsive Grid: 2x2 on mobile/tablet, 4-col on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {STATS_DATA.map((item) => (
            <div
              key={item.id}
              className="p-8 rounded-2xl bg-slate-50/80 hover:bg-socio-50/40 border border-slate-200/80 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-soft flex flex-col items-center text-center group"
            >
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200/60 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                {getIcon(item.iconName)}
              </div>

              {/* Number Count Display */}
              <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight flex items-center">
                <span>{counts[item.id] !== undefined ? counts[item.id] : item.valueNumber}</span>
                <span className="text-solar-500 ml-0.5">{item.suffix}</span>
              </div>

              <h3 className="text-base font-bold text-slate-800 mt-2">
                {item.label}
              </h3>
              
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {item.sublabel}
              </p>

              {item.isPlaceholderValue && (
                <span className="mt-3 inline-block text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  Representative Metric
                </span>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
