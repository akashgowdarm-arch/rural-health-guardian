import React, { useState } from 'react';
import { ProductGrid } from '../components/ProductGrid';
import { ProductItem } from '../data/products';
import { Search, Sparkles, ShieldCheck } from 'lucide-react';

interface ProductsPageProps {
  onOpenQuote: (product?: ProductItem) => void;
  onViewProductDetails: (product: ProductItem) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  onOpenQuote,
  onViewProductDetails,
}) => {
  return (
    <main className="flex-1 bg-white">
      {/* Header Banner */}
      <section className="relative py-16 sm:py-24 bg-navy-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1600&q=80"
            alt="Solar Panels Array"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-solar-500/20 text-solar-400 border border-solar-500/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OUR PRODUCTS</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            Solar Solutions for Every Requirement
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            High efficiency modules, smart hybrid inverters, scalable energy storage, certified racking systems, and precision balance-of-system electrical components.
          </p>
        </div>
      </section>

      {/* Main Catalog Area */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductGrid
          onViewDetails={onViewProductDetails}
          onRequestQuote={(prod) => onOpenQuote(prod)}
          showFilters={true}
        />

        {/* Wholesale Purchasing Notice */}
        <div className="mt-16 p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-socio-50 text-socio-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Bulk Volume Distribution &amp; Custom Sourcing
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Need container loads, megawatt allocations, or custom structural engineering profiles?
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenQuote()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-solar-600 hover:bg-solar-700 text-white text-sm font-bold shadow-soft transition-all whitespace-nowrap min-h-[44px]"
          >
            Request Commercial Quote
          </button>
        </div>
      </section>
    </main>
  );
};
