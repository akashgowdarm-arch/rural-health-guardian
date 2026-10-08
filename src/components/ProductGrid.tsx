import React, { useState } from 'react';
import { PRODUCTS, PRODUCT_CATEGORIES, ProductCategory, ProductItem } from '../data/products';
import { ProductCard } from './ProductCard';
import { ArrowRight, Filter } from 'lucide-react';

interface ProductGridProps {
  onViewDetails: (product: ProductItem) => void;
  onRequestQuote: (product: ProductItem) => void;
  limit?: number;
  showFilters?: boolean;
  onExploreAll?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  onViewDetails,
  onRequestQuote,
  limit,
  showFilters = true,
  onExploreAll,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');

  const filteredProducts = PRODUCTS.filter((item) => {
    if (selectedCategory === 'All') return true;
    return item.category === selectedCategory;
  });

  const displayedProducts = limit ? filteredProducts.slice(0, limit) : filteredProducts;

  return (
    <div className="space-y-8">
      {/* Category Filter Pills */}
      {showFilters && (
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-2 scrollbar-none gap-2 px-1">
          <div className="hidden sm:flex items-center text-xs font-semibold text-slate-400 mr-2">
            <Filter className="w-3.5 h-3.5 mr-1" />
            <span>Filter:</span>
          </div>
          {PRODUCT_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 min-h-[40px] ${
                  isSelected
                    ? 'bg-socio-600 text-white shadow-md shadow-socio-600/25 scale-[1.02]'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* Responsive Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
        {displayedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onViewDetails={onViewDetails}
            onRequestQuote={onRequestQuote}
          />
        ))}
      </div>

      {/* Optional "Explore All Products" Action */}
      {onExploreAll && limit && filteredProducts.length > limit && (
        <div className="text-center pt-6">
          <button
            onClick={onExploreAll}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-socio-600 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all duration-200 shadow-sm"
          >
            <span>View All Solar Equipment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
