import React from 'react';
import { ArrowRight, PhoneCall, Mail } from 'lucide-react';
import { COMPANY_CONFIG } from '../data/company';

interface CTAProps {
  onGetInTouch: () => void;
  onOpenQuote: () => void;
}

export const CTA: React.FC<CTAProps> = ({ onGetInTouch, onOpenQuote }) => {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 bg-navy-950 text-white">
      {/* Background Solar Panel Image with Dark Overlay */}
      <div className="absolute inset-0 z-0 opacity-25">
        <img
          src="https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1800&q=80"
          alt="Solar Farm Clean Energy"
          className="w-full h-full object-cover animate-pulse-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-900/90 to-navy-950" />
      </div>

      {/* Subtle glowing orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-solar-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-socio-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-solar-400 text-xs sm:text-sm font-bold tracking-wider uppercase">
          READY TO ELEVATE YOUR SOLAR SUPPLY?
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
          Let's Build a Cleaner,
          <span className="text-solar-500 block">Brighter Tomorrow Together</span>
        </h2>

        {/* Supporting text */}
        <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Partner with SOCIO Solar Systems for trusted products, reliable supply, and expert support.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onGetInTouch}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-solar-600 hover:bg-solar-700 text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg shadow-solar-600/30 hover:shadow-orange-glow transition-all duration-300 transform hover:-translate-y-1 min-h-[48px]"
          >
            <span>GET IN TOUCH</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenQuote}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-base px-8 py-4 rounded-xl backdrop-blur-md transition-all duration-300 min-h-[48px]"
          >
            <span>REQUEST A QUOTE</span>
          </button>
        </div>

        {/* Quick Contact Line */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-solar-400" />
            <span>{COMPANY_CONFIG.contact.phone}</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-socio-400" />
            <span>{COMPANY_CONFIG.contact.email}</span>
          </div>
        </div>

      </div>
    </section>
  );
};
