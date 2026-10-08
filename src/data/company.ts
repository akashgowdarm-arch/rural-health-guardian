/**
 * SOCIO SOLAR SYSTEMS - Company & Brand Configuration
 * 
 * All company contact details and external links are kept here for quick editing.
 * Placeholders are clearly marked and should be replaced when official business details are provided.
 */

export interface CompanyConfig {
  name: string;
  tagline: string;
  eyebrow: string;
  shortDescription: string;
  longDescription: string;
  businessType: string;
  contact: {
    phone: string;
    email: string;
    address: string;
    whatsapp: string;
  };
  social: {
    linkedin: string;
    instagram: string;
    facebook: string;
    youtube: string;
  };
  brandColors: {
    primaryBlue: string;
    solarOrange: string;
    deepNavy: string;
    lightGray: string;
  };
}

export const COMPANY_CONFIG: CompanyConfig = {
  name: 'SOCIO SOLAR SYSTEMS',
  tagline: 'Reliable Solar Products. A Sustainable Future.',
  eyebrow: 'CLEAN ENERGY. BRIGHTER TOMORROW.',
  shortDescription: 'SOCIO Solar Systems is your trusted distribution partner for premium solar products and solutions.',
  longDescription: 'SOCIO Solar Systems provides reliable solar products, distribution and solar solutions for residential, commercial and industrial applications. We connect world-class solar technology manufacturers with qualified installers, EPC contractors, and end clients.',
  businessType: 'Solar Products Distribution & Solar Solutions',
  contact: {
    phone: '[ADD PHONE NUMBER]',
    email: '[ADD EMAIL ADDRESS]',
    address: '[ADD BUSINESS ADDRESS]',
    whatsapp: '[ADD WHATSAPP NUMBER]',
  },
  social: {
    linkedin: 'https://linkedin.com/company/placeholder',
    instagram: 'https://instagram.com/placeholder',
    facebook: 'https://facebook.com/placeholder',
    youtube: 'https://youtube.com/placeholder',
  },
  brandColors: {
    primaryBlue: '#0258A6',
    solarOrange: '#F36F21',
    deepNavy: '#0B1B3D',
    lightGray: '#F8FAFC',
  },
};

export interface NavLink {
  label: string;
  href: string;
  pageId: 'home' | 'about' | 'products' | 'solutions' | 'distribution' | 'contact';
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/', pageId: 'home' },
  { label: 'About', href: '/about', pageId: 'about' },
  { label: 'Products', href: '/products', pageId: 'products' },
  { label: 'Solutions', href: '/solutions', pageId: 'solutions' },
  { label: 'Distribution', href: '/distribution', pageId: 'distribution' },
  { label: 'Contact', href: '/contact', pageId: 'contact' },
];
