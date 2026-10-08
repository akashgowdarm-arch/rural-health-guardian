import React from 'react';
import { COMPANY_CONFIG } from '../data/company';
import { Target, Compass, HeartHandshake, ShieldCheck, Sun, ArrowRight, Award, Zap } from 'lucide-react';

interface AboutPageProps {
  onOpenQuote: () => void;
  onNavigateContact: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenQuote, onNavigateContact }) => {
  const values = [
    {
      title: 'Reliability & Authenticity',
      desc: 'Supplying strictly genuine, certified tier-1 solar technology backed by comprehensive manufacturer warranties.',
      icon: ShieldCheck,
    },
    {
      title: 'Sustainable Impact',
      desc: 'Accelerating the global transition to clean, decentralized solar power through robust supply chain execution.',
      icon: Sun,
    },
    {
      title: 'Partner Empowerment',
      desc: 'Equipping installers, EPCs, and retail dealers with responsive logistics, technical training, and fair trade pricing.',
      icon: HeartHandshake,
    },
    {
      title: 'Engineering Rigor',
      desc: 'Evaluating balance-of-system components and solar inverters to ensure maximum system uptime and yield.',
      icon: Zap,
    },
  ];

  return (
    <main className="flex-1 bg-white">
      {/* Page Hero */}
      <section className="relative py-20 sm:py-28 bg-navy-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1600&q=80"
            alt="Solar installation background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-block px-3.5 py-1 rounded-full bg-solar-500/20 text-solar-400 border border-solar-500/30 text-xs font-bold uppercase tracking-wider">
            WHO WE ARE
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white">
            About SOCIO Solar Systems
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {COMPANY_CONFIG.shortDescription}
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-solar-600">
                OUR JOURNEY
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                Our Story
              </h2>
              <p className="text-slate-600 leading-relaxed text-base">
                SOCIO Solar Systems was founded with a singular, resolute purpose: to eliminate friction in the renewable energy supply chain. As solar technology has evolved, solar contractors and regional dealers have faced recurring challenges with component availability, inconsistent quality, and fragmented logistics.
              </p>
              <p className="text-slate-600 leading-relaxed text-base">
                By forming disciplined distribution relationships with leading photovoltaic module makers, smart inverter manufacturers, and energy storage innovators, SOCIO Solar Systems provides a single, trusted gateway for high-performance solar solutions.
              </p>
              
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                Company historical timeline and specific incorporation milestones to be updated when official archival records are supplied.
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1548611716-ad3833d7591c?auto=format&fit=crop&w=1000&q=80"
                  alt="Solar Engineers Reviewing Project Plan"
                  className="w-full h-[420px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white text-xs sm:text-sm font-semibold glass-panel-dark p-4 rounded-xl">
                  Dedicated to engineering integrity, wholesale transparency, and renewable energy adoption.
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-slate-50/70 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Mission */}
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-soft space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-socio-50 text-socio-600 flex items-center justify-center">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Our Mission</h3>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                To serve as the most dependable and technically proficient distribution channel for solar hardware, ensuring that installers and contractors always have rapid access to certified modules, inverters, and storage systems that stand the test of time.
              </p>
            </div>

            {/* Vision */}
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-soft space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-solar-50 text-solar-600 flex items-center justify-center">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Our Vision</h3>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                To power a cleaner, electrified tomorrow by creating an interconnected network of trusted solar distribution centers that make decentralized clean energy affordable, predictable, and universally accessible.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-solar-600">
              GUIDING PRINCIPLES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
              Our Core Values
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-socio-50/30 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-white text-socio-600 shadow-sm border border-slate-200/60 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {v.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {v.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA on About */}
      <section className="py-16 bg-navy-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">
            Ready to Partner with SOCIO Solar Systems?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Join our dealer network, schedule volume dispatches, and get direct commercial quotes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onOpenQuote}
              className="bg-solar-600 hover:bg-solar-700 text-white font-bold text-sm px-7 py-3.5 rounded-xl transition-all shadow-md"
            >
              Request a Quote
            </button>
            <button
              onClick={onNavigateContact}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-7 py-3.5 rounded-xl transition-all border border-white/20"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};
