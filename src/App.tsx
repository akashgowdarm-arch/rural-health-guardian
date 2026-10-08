import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ProductsPage } from './pages/ProductsPage';
import { SolutionsPage } from './pages/SolutionsPage';
import { DistributionPage } from './pages/DistributionPage';
import { ContactPage } from './pages/ContactPage';
import { QuoteModal } from './components/QuoteModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { NavLink } from './data/company';
import { ProductItem } from './data/products';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<NavLink['pageId']>('home');
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedProductForQuote, setSelectedProductForQuote] = useState<ProductItem | null>(null);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<ProductItem | null>(null);

  // Sync with URL Hash on Mount & Popstate
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '').trim();
      const validPages: NavLink['pageId'][] = ['home', 'about', 'products', 'solutions', 'distribution', 'contact'];
      if (validPages.includes(hash as NavLink['pageId'])) {
        setCurrentPage(hash as NavLink['pageId']);
      } else if (!hash || hash === '') {
        setCurrentPage('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (pageId: NavLink['pageId']) => {
    setCurrentPage(pageId);
    window.location.hash = pageId === 'home' ? '/' : `/${pageId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenQuote = (product?: ProductItem) => {
    if (product) {
      setSelectedProductForQuote(product);
    } else {
      setSelectedProductForQuote(null);
    }
    setQuoteModalOpen(true);
  };

  const handleCloseQuote = () => {
    setQuoteModalOpen(false);
    setSelectedProductForQuote(null);
  };

  const handleViewProductDetails = (product: ProductItem) => {
    setSelectedProductForDetail(product);
  };

  const handleCloseProductDetails = () => {
    setSelectedProductForDetail(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-solar-500 selection:text-white">
      {/* Top Sticky Header */}
      <Header
        currentPage={currentPage}
        onNavigate={navigateTo}
        onOpenQuote={() => handleOpenQuote()}
      />

      {/* Dynamic Page Views */}
      {currentPage === 'home' && (
        <HomePage
          onNavigate={navigateTo}
          onOpenQuote={handleOpenQuote}
          onViewProductDetails={handleViewProductDetails}
        />
      )}

      {currentPage === 'about' && (
        <AboutPage
          onOpenQuote={() => handleOpenQuote()}
          onNavigateContact={() => navigateTo('contact')}
        />
      )}

      {currentPage === 'products' && (
        <ProductsPage
          onOpenQuote={handleOpenQuote}
          onViewProductDetails={handleViewProductDetails}
        />
      )}

      {currentPage === 'solutions' && (
        <SolutionsPage
          onOpenQuote={() => handleOpenQuote()}
          onNavigateContact={() => navigateTo('contact')}
        />
      )}

      {currentPage === 'distribution' && (
        <DistributionPage
          onOpenQuote={() => handleOpenQuote()}
          onNavigateContact={() => navigateTo('contact')}
        />
      )}

      {currentPage === 'contact' && (
        <ContactPage />
      )}

      {/* Global Quote Request Modal */}
      <QuoteModal
        isOpen={quoteModalOpen}
        onClose={handleCloseQuote}
        preselectedProduct={selectedProductForQuote}
      />

      {/* Global Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductForDetail}
        onClose={handleCloseProductDetails}
        onRequestQuote={handleOpenQuote}
      />

      {/* Premium Footer */}
      <Footer
        onNavigate={navigateTo}
        onOpenQuote={() => handleOpenQuote()}
      />
    </div>
  );
};

export default App;
