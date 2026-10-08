import React, { useState, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';
import { NAV_LINKS, NavLink } from '../data/company';
import { Menu, X, ArrowRight, Sun } from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  onNavigate: (pageId: NavLink['pageId']) => void;
  onOpenQuote: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  onOpenQuote,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (pageId: NavLink['pageId']) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 bg-white/95 backdrop-blur-md ${
          isScrolled
            ? 'py-2.5 shadow-md border-b border-slate-200/80'
            : 'py-4 border-b border-slate-100 shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo on Left */}
          <button
            onClick={() => handleLinkClick('home')}
            className="flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-socio-600 rounded-lg"
            aria-label="SOCIO Solar Systems Home"
          >
            <BrandLogo variant="header" />
          </button>

          {/* Desktop & Wide Tablet Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {NAV_LINKS.map((link) => {
              const isActive = currentPage === link.pageId;
              return (
                <button
                  key={link.pageId}
                  onClick={() => handleLinkClick(link.pageId)}
                  className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 relative ${
                    isActive
                      ? 'text-socio-600'
                      : 'text-slate-700 hover:text-socio-600 hover:bg-socio-50/50'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-socio-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Orange Button "GET A QUOTE" */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={onOpenQuote}
              className="inline-flex items-center gap-2 bg-solar-600 hover:bg-solar-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-soft hover:shadow-orange-glow transition-all duration-300 transform hover:-translate-y-0.5 min-h-[44px]"
            >
              <span>GET A QUOTE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile & Medium Tablet Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onOpenQuote}
              className="hidden sm:inline-flex items-center text-xs font-bold bg-solar-600 hover:bg-solar-700 text-white px-3.5 py-2 rounded-lg transition-colors min-h-[40px]"
            >
              GET A QUOTE
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 hover:text-socio-600 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-socio-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation Panel */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex flex-col justify-between bg-white/98 backdrop-blur-xl pt-24 pb-8 px-6 overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-3 flex items-center gap-2">
              <Sun className="w-4 h-4 text-solar-500" />
              <span>Navigation Menu</span>
            </div>
            {NAV_LINKS.map((link) => {
              const isActive = currentPage === link.pageId;
              return (
                <button
                  key={link.pageId}
                  onClick={() => handleLinkClick(link.pageId)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl text-base font-bold transition-all flex items-center justify-between min-h-[48px] ${
                    isActive
                      ? 'bg-socio-50 text-socio-700 border-l-4 border-socio-600 shadow-sm'
                      : 'text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-solar-500" />}
                </button>
              );
            })}
          </div>

          <div className="pt-6 border-t border-slate-200 mt-6 space-y-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenQuote();
              }}
              className="w-full py-3.5 px-6 rounded-xl bg-solar-600 hover:bg-solar-700 text-white font-bold text-center shadow-lg shadow-solar-600/25 flex items-center justify-center gap-2 min-h-[48px]"
            >
              <span>GET A QUOTE</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-center text-xs text-slate-500">
              Reliable Solar Products. A Sustainable Future.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
