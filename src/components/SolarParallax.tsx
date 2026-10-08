import React, { useEffect, useState } from 'react';

export const SolarParallax: React.FC = () => {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffsetY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40 bg-slate-950 text-white flex items-center justify-center">
      {/* Background Solar-Panel Photograph with Parallax Shift */}
      <div
        style={{
          transform: `translate3d(0, ${(offsetY * 0.08) % 150}px, 0) scale(1.15)`,
          transition: 'transform 0.05s linear',
        }}
        className="absolute inset-0 w-full h-[140%] -top-[20%] pointer-events-none"
      >
        <img
          src="https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=2000&q=85"
          alt="Solar Panel Field Landscape"
          className="w-full h-full object-cover filter brightness-75 contrast-125"
        />
        {/* Layered dark overlays for contrast & brand tint */}
        <div className="absolute inset-0 bg-navy-950/70 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-transparent to-navy-950 opacity-90" />
      </div>

      {/* Foreground Typography Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-bold tracking-widest uppercase text-solar-400">
          GLOBAL ENERGY VISION
        </div>

        {/* Large Typography: POWERING PEOPLE PLANET PROGRESS */}
        <div className="space-y-2 sm:space-y-3">
          <div className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white/95 uppercase drop-shadow-lg">
            POWERING
          </div>
          <div className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white/95 uppercase drop-shadow-lg flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
            <span>PEOPLE</span>
            <span className="text-solar-500">•</span>
            <span>PLANET</span>
          </div>
          <div className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-solar-500 uppercase drop-shadow-xl">
            PROGRESS
          </div>
        </div>

        {/* Subtle Orange Accent Line */}
        <div className="flex justify-center pt-2">
          <div className="w-28 sm:w-36 h-1.5 bg-gradient-to-r from-transparent via-solar-500 to-transparent rounded-full shadow-orange-glow" />
        </div>

        <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-slate-300 font-medium pt-2 leading-relaxed">
          Delivering advanced photovoltaic solutions that empower commercial enterprise, residential autonomy, and planetary resilience.
        </p>
      </div>
    </section>
  );
};
