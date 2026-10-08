import React from 'react';
import { ThreeDHero } from './ThreeDHero';
import { TrustPoints } from './TrustPoints';
import { ArrowRight, FileText } from 'lucide-react';
import { COMPANY_CONFIG } from '../data/company';

interface HeroProps {
  onViewProducts: () => void;
  onOpenQuote: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onViewProducts, onOpenQuote }) => {
  return (
    <section className="relative overflow-hidden bg-socio-hero pt-6 sm:pt-10 pb-16 lg:py-20 border-b border-slate-100">
      {/* Subtle ambient lighting orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-socio-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-solar-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/*
          Responsive layout:
          Desktop: 2 columns [Left: Text/CTA/Trust, Right: 3D Visual]
          Mobile: Single column with order: 3D Visual first -> Eyebrow -> Headline -> Description -> Buttons -> Trust
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* 3D Visual: Ordered second on desktop, first on mobile */}
          <div className="order-1 lg:order-2 lg:col-span-6 xl:col-span-6 w-full">
            <ThreeDHero />
          </div>

          {/* Headline & Actions: Ordered first on desktop, second on mobile */}
          <div className="order-2 lg:order-1 lg:col-span-6 xl:col-span-6 space-y-6 sm:space-y-8">
            
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-socio-50 border border-socio-200/80 text-socio-700 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm">
              <span className="w-2 h-2 rounded-full bg-solar-500 animate-pulse" />
              <span>{COMPANY_CONFIG.eyebrow}</span>
            </div>

            {/* Main Heading: "Powering A Sustainable Future" */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08]">
              <span className="text-socio-600 block">Powering</span>
              <span className="text-socio-600 block">A Sustainable</span>
              <span className="text-solar-600 block mt-1">Future</span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg md:text-xl text-slate-600 font-normal leading-relaxed max-w-xl">
              {COMPANY_CONFIG.shortDescription}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              {/* Primary Button: View Products */}
              <button
                onClick={onViewProducts}
                className="inline-flex items-center justify-center gap-2.5 bg-solar-600 hover:bg-solar-700 active:bg-solar-800 text-white font-bold text-base px-7 py-3.5 rounded-xl shadow-soft hover:shadow-orange-glow transition-all duration-300 transform hover:-translate-y-0.5 min-h-[48px]"
              >
                <span>VIEW PRODUCTS</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Secondary Button: Get a Quote */}
              <button
                onClick={onOpenQuote}
                className="inline-flex items-center justify-center gap-2.5 bg-white hover:bg-socio-600 text-socio-600 hover:text-white border-2 border-socio-600 font-bold text-base px-7 py-3.5 rounded-xl shadow-sm transition-all duration-300 transform hover:-translate-y-0.5 min-h-[48px]"
              >
                <FileText className="w-5 h-5" />
                <span>GET A QUOTE</span>
              </button>
            </div>

            {/* Three Trust Indicators */}
            <TrustPoints />
          </div>

        </div>
      </div>
    </section>
  );
};
