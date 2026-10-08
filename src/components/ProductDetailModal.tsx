import React, { useState } from 'react';
import { ProductItem } from '../data/products';
import { X, CheckCircle2, ShieldAlert, Sparkles, FileText, ArrowRight, Layers } from 'lucide-react';

interface ProductDetailModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onRequestQuote: (product: ProductItem) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onRequestQuote,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'applications' | 'specs'>('overview');
  const [interactiveAngle, setInteractiveAngle] = useState({ x: 0, y: 0 });

  if (!product) return null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setInteractiveAngle({ x: y, y: x });
  };

  const resetAngle = () => {
    setInteractiveAngle({ x: 0, y: 0 });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-title"
    >
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-auto flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-socio-50 text-socio-700 border border-socio-200">
              {product.category}
            </span>
            {product.badge && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-solar-500 text-white">
                {product.badge}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two Columns */}
        <div className="p-6 sm:p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Column: 3D Product Interactive Presentation */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div
              onMouseMove={handleMouseMove}
              onMouseLeave={resetAngle}
              style={{
                transform: `perspective(900px) rotateX(${interactiveAngle.x}deg) rotateY(${interactiveAngle.y}deg)`,
                transition: 'transform 0.15s ease-out',
              }}
              className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-slate-900 group cursor-grab"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-navy-950/70 via-transparent to-white/10 pointer-events-none" />
              
              {/* 3D Depth Specular Sheen */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-medium text-white/90 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-solar-400" />
                  <span>3D Interactive Card</span>
                </span>
                <span className="text-white/60">Hover to rotate</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-3 text-center">
              Perspective visual simulation for {product.name}.
            </p>
          </div>

          {/* Right Column: Information & Actions */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-solar-600">
                {product.tagline}
              </span>
              <h2 id="product-title" className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {product.name}
              </h2>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                {product.shortDescription}
              </p>

              {/* Tabs for Overview, Features, Applications, Specs */}
              <div className="flex border-b border-slate-200 mt-6 gap-2 sm:gap-4 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-2.5 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap relative ${
                    activeTab === 'overview'
                      ? 'text-socio-600 border-b-2 border-socio-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('features')}
                  className={`pb-2.5 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap relative ${
                    activeTab === 'features'
                      ? 'text-socio-600 border-b-2 border-socio-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Features
                </button>
                <button
                  onClick={() => setActiveTab('applications')}
                  className={`pb-2.5 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap relative ${
                    activeTab === 'applications'
                      ? 'text-socio-600 border-b-2 border-socio-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Applications
                </button>
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`pb-2.5 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap relative ${
                    activeTab === 'specs'
                      ? 'text-socio-600 border-b-2 border-socio-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Specifications
                </button>
              </div>

              {/* Tab Panels */}
              <div className="py-4 text-sm">
                {activeTab === 'overview' && (
                  <p className="text-slate-700 leading-relaxed">
                    {product.overview}
                  </p>
                )}

                {activeTab === 'features' && (
                  <div className="space-y-2">
                    {product.features.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-solar-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'applications' && (
                  <div className="space-y-2">
                    {product.applications.map((app, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-slate-700">
                        <Layers className="w-4 h-4 text-socio-600 mt-0.5 flex-shrink-0" />
                        <span>{app}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/70 text-amber-900 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-amber-900">Official Datasheet Note</h4>
                      <p className="text-xs text-amber-800 mt-1">
                        {product.specsPlaceholder}. Real-world electrical characteristics, wattage tiers, and certifications will be furnished upon quotation request.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  onRequestQuote(product);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-solar-600 hover:bg-solar-700 text-white font-bold text-sm py-3 px-5 rounded-xl shadow-soft hover:shadow-orange-glow transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Request Quotation</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors"
              >
                Close
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
