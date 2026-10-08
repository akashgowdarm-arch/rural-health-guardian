import React from 'react';
import { ContactForm } from '../components/ContactForm';
import { Mail, Phone, MapPin, MessageSquare, Clock } from 'lucide-react';
import { COMPANY_CONFIG } from '../data/company';

export const ContactPage: React.FC = () => {
  return (
    <main className="flex-1 bg-white">
      {/* Header Banner */}
      <section className="relative py-16 sm:py-24 bg-navy-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1600&q=80"
            alt="Solar contact support"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-solar-500/20 text-solar-400 border border-solar-500/30 text-xs font-bold uppercase tracking-wider">
            <Mail className="w-3.5 h-3.5" />
            <span>CONTACT US</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            Get in Touch with Our Solar Team
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Have questions regarding component availability, delivery lead times, or commercial partnerships? We're here to assist.
          </p>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ContactForm />
      </section>

      {/* Map / Logistics Staging Area Placeholder */}
      <section className="pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-50 border border-slate-200/80 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white text-socio-600 shadow-sm border border-slate-200/60 mx-auto flex items-center justify-center">
            <MapPin className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Regional Logistics &amp; Warehousing Staging
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {COMPANY_CONFIG.contact.address}
          </p>
          <div className="inline-block text-[11px] font-semibold text-slate-400 bg-white px-4 py-1.5 rounded-full border border-slate-200">
            [INTERACTIVE WAREHOUSE LOCATION MAP TO BE EMBEDDED]
          </div>
        </div>
      </section>
    </main>
  );
};
