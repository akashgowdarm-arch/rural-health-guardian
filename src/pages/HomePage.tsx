import React from 'react';
import { Hero } from '../components/Hero';
import { ProductGrid } from '../components/ProductGrid';
import { WhyChoose } from '../components/WhyChoose';
import { SolarParallax } from '../components/SolarParallax';
import { Stats } from '../components/Stats';
import { Solutions } from '../components/Solutions';
import { DistributionFlow } from '../components/DistributionFlow';
import { Partners } from '../components/Partners';
import { CTA } from '../components/CTA';
import { ProductItem } from '../data/products';
import { SolarSolution } from '../data/solutions';
import { NavLink } from '../data/company';

interface HomePageProps {
  onNavigate: (pageId: NavLink['pageId']) => void;
  onOpenQuote: (product?: ProductItem) => void;
  onViewProductDetails: (product: ProductItem) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenQuote,
  onViewProductDetails,
}) => {
  return (
    <main className="flex-1">
      {/* 1. IMMERSIVE 3D HERO */}
      <Hero
        onViewProducts={() => onNavigate('products')}
        onOpenQuote={() => onOpenQuote()}
      />

      {/* 2. PRODUCTS SECTION */}
      <section className="py-20 sm:py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-block px-3.5 py-1 rounded-full bg-solar-50 border border-solar-200 text-solar-700 text-xs font-bold uppercase tracking-wider mb-3">
              OUR PRODUCTS
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Complete Solar Solutions
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed">
              High-quality solar products for residential, commercial, and industrial needs.
            </p>
          </div>

          <ProductGrid
            onViewDetails={onViewProductDetails}
            onRequestQuote={(prod) => onOpenQuote(prod)}
            limit={6}
            showFilters={true}
            onExploreAll={() => onNavigate('products')}
          />
        </div>
      </section>

      {/* 3. WHY CHOOSE SOCIO */}
      <WhyChoose
        onLearnMore={() => onNavigate('distribution')}
        onOpenQuote={() => onOpenQuote()}
      />

      {/* 4. SOLAR PARALLAX SECTION */}
      <SolarParallax />

      {/* 5. STATISTICS SECTION */}
      <Stats />

      {/* 6. SOLUTIONS SECTION */}
      <Solutions
        onSelectSolution={() => onNavigate('solutions')}
        onOpenQuote={() => onOpenQuote()}
      />

      {/* 7. DISTRIBUTION PROCESS */}
      <DistributionFlow
        onExploreMore={() => onNavigate('distribution')}
        onOpenQuote={() => onOpenQuote()}
      />

      {/* 8. PARTNERS SECTION */}
      <Partners />

      {/* 9. CTA SECTION */}
      <CTA
        onGetInTouch={() => onNavigate('contact')}
        onOpenQuote={() => onOpenQuote()}
      />
    </main>
  );
};
