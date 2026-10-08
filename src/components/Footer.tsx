import React from 'react';
import { BrandLogo } from './BrandLogo';
import { COMPANY_CONFIG, NAV_LINKS, NavLink } from '../data/company';
import { Phone, Mail, MapPin, MessageSquare, Linkedin, Instagram, Facebook, Youtube, Sun, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (pageId: NavLink['pageId']) => void;
  onOpenQuote: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenQuote }) => {
  const scrollToTop = (pageId: NavLink['pageId']) => {
    onNavigate(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const productCategories = [
    'Solar Panels',
    'Solar Inverters',
    'Solar Batteries',
    'Mounting Structures',
    'Solar Accessories',
  ];

  return (
    <footer className="bg-navy-950 text-slate-300 border-t border-navy-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid: 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-navy-800">
          
          {/* Column 1: Brand & Identity (Lg: 4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white p-2.5 rounded-2xl inline-block shadow-md">
              <BrandLogo variant="footer" />
            </div>
            
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              <span className="font-semibold text-white block">Reliable Solar Products.</span>
              <span className="text-solar-400 font-semibold block">A Sustainable Future.</span>
              <span className="text-xs text-slate-400 block mt-2">
                Wholesale solar distribution connecting tier-1 hardware with certified installers and renewable infrastructure developers.
              </span>
            </p>

            {/* Social Media Links (Placeholders clearly designated) */}
            <div className="pt-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-2.5">
                Official Channels
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href={COMPANY_CONFIG.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-navy-900 border border-white/10 hover:border-solar-500 text-slate-300 hover:text-solar-400 flex items-center justify-center transition-all duration-200"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href={COMPANY_CONFIG.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-navy-900 border border-white/10 hover:border-solar-500 text-slate-300 hover:text-solar-400 flex items-center justify-center transition-all duration-200"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href={COMPANY_CONFIG.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-navy-900 border border-white/10 hover:border-solar-500 text-slate-300 hover:text-solar-400 flex items-center justify-center transition-all duration-200"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href={COMPANY_CONFIG.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-navy-900 border border-white/10 hover:border-solar-500 text-slate-300 hover:text-solar-400 flex items-center justify-center transition-all duration-200"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links (Lg: 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.pageId}>
                  <button
                    onClick={() => scrollToTop(link.pageId)}
                    className="hover:text-solar-400 transition-colors flex items-center gap-1.5"
                  >
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={onOpenQuote}
                  className="text-solar-400 font-bold hover:text-solar-300 flex items-center gap-1"
                >
                  <span>Get a Quote</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Products (Lg: 3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Product Categories
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {productCategories.map((cat, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => scrollToTop('products')}
                    className="hover:text-solar-400 transition-colors text-left"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Information (Lg: 3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Contact Desk
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-solar-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Phone</span>
                  <span className="text-slate-200">{COMPANY_CONFIG.contact.phone}</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-socio-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Email</span>
                  <span className="text-slate-200">{COMPANY_CONFIG.contact.email}</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-solar-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Address</span>
                  <span className="text-slate-200 leading-snug">{COMPANY_CONFIG.contact.address}</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">WhatsApp</span>
                  <span className="text-slate-200">{COMPANY_CONFIG.contact.whatsapp}</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} SOCIO Solar Systems. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Wholesale Solar Distribution</span>
            <span>•</span>
            <span>Clean Energy Engineering</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
