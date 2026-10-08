import React, { useState } from 'react';
import { X, CheckCircle2, Send, Sun, ArrowRight, ShieldAlert } from 'lucide-react';
import { ProductItem } from '../data/products';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProduct?: ProductItem | null;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  preselectedProduct,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    city: '',
    productInterestedIn: preselectedProduct ? preselectedProduct.category : 'Solar Panels',
    quantity: '',
    requirement: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulated Frontend Demo Submission
    // Integrates with backend endpoint via POST /api/quote
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      company: '',
      phone: '',
      email: '',
      city: '',
      productInterestedIn: 'Solar Panels',
      quantity: '',
      requirement: '',
      message: '',
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-modal-title"
    >
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-auto">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-solar-500 text-white flex items-center justify-center">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <h2 id="quote-modal-title" className="text-xl font-extrabold text-slate-900 leading-tight">
                Get a Solar Quote
              </h2>
              <p className="text-xs text-slate-500">
                Direct wholesale pricing and project availability.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Close quote modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
          {submitted ? (
            /* Success State */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center animate-in zoom-in-75">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Quotation Request Received
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you, <span className="font-semibold text-slate-900">{formData.name}</span>. Your enquiry for <span className="font-semibold text-socio-700">{formData.productInterestedIn}</span> has been logged into our distribution queue. Our sales engineering team will review and reply within 1 business day.
              </p>
              
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 max-w-sm mx-auto">
                Demo state: Hook your backend mailer or CRM directly to the form handler.
              </div>

              <div className="pt-4">
                <button
                  onClick={handleReset}
                  className="bg-socio-600 hover:bg-socio-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  Close &amp; Return
                </button>
              </div>
            </div>
          ) : (
            /* Quote Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-socio-600 focus:ring-2 focus:ring-socio-600/20 text-sm outline-none transition-all"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company"
                    placeholder="e.g. Solar EPC / Enterprise"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-socio-600 focus:ring-2 focus:ring-socio-600/20 text-sm outline-none transition-all"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="Contact telephone / mobile"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-socio-600 focus:ring-2 focus:ring-socio-600/20 text-sm outline-none transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-socio-600 focus:ring-2 focus:ring-socio-600/20 text-sm outline-none transition-all"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    City / Project Location *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="Delivery destination"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-socio-600 focus:ring-2 focus:ring-socio-600/20 text-sm outline-none transition-all"
                  />
                </div>

                {/* Product Interested In */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Product Interested In *
                  </label>
                  <select
                    name="productInterestedIn"
                    value={formData.productInterestedIn}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-socio-600 focus:ring-2 focus:ring-socio-600/20 text-sm outline-none transition-all bg-white"
                  >
                    <option value="Solar Panels">Solar Panels</option>
                    <option value="Solar Inverters">Solar Inverters</option>
                    <option value="Solar Batteries">Solar Batteries</option>
                    <option value="Mounting Structures">Mounting Structures</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Quantity / System Capacity
                </label>
                <input
                  type="text"
                  name="quantity"
                  placeholder="e.g. 50 Panels, 10kW Inverter, or container load"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-socio-600 focus:ring-2 focus:ring-socio-600/20 text-sm outline-none transition-all"
                />
              </div>

              {/* Requirement */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Project Requirement Type
                </label>
                <input
                  type="text"
                  name="requirement"
                  placeholder="e.g. Residential, Commercial Rooftop, Ground Mount, Resale"
                  value={formData.requirement}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-socio-600 focus:ring-2 focus:ring-socio-600/20 text-sm outline-none transition-all"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Message / Specifications Needed
                </label>
                <textarea
                  name="message"
                  rows={3}
                  placeholder="Describe your project schedule, preferred brands, or delivery timeline..."
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-socio-600 focus:ring-2 focus:ring-socio-600/20 text-sm outline-none transition-all"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-solar-600 hover:bg-solar-700 text-white font-extrabold text-sm sm:text-base py-3.5 px-6 rounded-xl shadow-soft hover:shadow-orange-glow transition-all duration-300 min-h-[48px]"
                >
                  {isSubmitting ? (
                    <span>Processing Request...</span>
                  ) : (
                    <>
                      <span>REQUEST A QUOTE</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center pt-2">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                <span>Your information is handled securely for wholesale distribution estimates only.</span>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
