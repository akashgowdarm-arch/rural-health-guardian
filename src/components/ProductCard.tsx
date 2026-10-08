import React, { useState, useRef } from 'react';
import { ProductItem } from '../data/products';
import { ArrowUpRight, FileText, CheckCircle2 } from 'lucide-react';

interface ProductCardProps {
  product: ProductItem;
  onViewDetails: (product: ProductItem) => void;
  onRequestQuote: (product: ProductItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onRequestQuote,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // 3D subtle mouse tracking tilt on desktop
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle tilt: max ~6 degrees
    const rX = ((y - centerY) / centerY) * -5;
    const rY = ((x - centerX) / centerX) * 5;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)',
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out, box-shadow 0.3s ease',
      }}
      className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-soft hover:shadow-card-hover flex flex-col justify-between overflow-hidden"
    >
      {/* Top Image Container with subtle depth */}
      <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-slate-100">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-socio-700 shadow-sm border border-white/40">
            {product.category}
          </span>
        </div>

        {/* Optional Badge */}
        {product.badge && (
          <div className="absolute top-3 right-3">
            <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-solar-500 text-white shadow-sm">
              {product.badge}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xs font-semibold text-solar-600 uppercase tracking-wider mb-1">
            {product.tagline}
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-socio-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Key Feature highlights preview */}
          <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
            {product.features.slice(0, 2).map((feat, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-solar-500 flex-shrink-0" />
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons: View Details & Request Quote */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={() => onViewDetails(product)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-socio-600 hover:text-socio-800 transition-colors p-1"
          >
            <span>View Details</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onRequestQuote(product)}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-socio-50 hover:bg-solar-600 text-socio-700 hover:text-white px-3.5 py-2 rounded-xl transition-all duration-300 min-h-[36px]"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Request Quote</span>
          </button>
        </div>
      </div>
    </div>
  );
};
