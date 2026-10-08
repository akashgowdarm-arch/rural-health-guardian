/**
 * SOCIO SOLAR SYSTEMS - Partner Brands Data
 * 
 * Rules:
 * - DO NOT INVENT PARTNERSHIPS.
 * - Elegant placeholder logo blocks with clean visual styling.
 * - Easily replaceable with real brand SVG/PNG assets.
 */

export interface PartnerPlaceholder {
  id: string;
  name: string;
  category: string;
  logoPlaceholder: string;
  isPlaceholder: boolean;
}

export const PARTNERS_DATA: PartnerPlaceholder[] = [
  {
    id: 'brand-1',
    name: 'TIER-1 BRAND A',
    category: 'Solar PV Modules',
    logoPlaceholder: 'PARTNER LOGO',
    isPlaceholder: true,
  },
  {
    id: 'brand-2',
    name: 'GLOBAL BRAND B',
    category: 'Hybrid Inverters',
    logoPlaceholder: 'PARTNER LOGO',
    isPlaceholder: true,
  },
  {
    id: 'brand-3',
    name: 'STORAGE BRAND C',
    category: 'Lithium ESS Systems',
    logoPlaceholder: 'PARTNER LOGO',
    isPlaceholder: true,
  },
  {
    id: 'brand-4',
    name: 'RACKING BRAND D',
    category: 'Mounting Systems',
    logoPlaceholder: 'PARTNER LOGO',
    isPlaceholder: true,
  },
  {
    id: 'brand-5',
    name: 'ELECTRICAL BRAND E',
    category: 'Cables & Balance of System',
    logoPlaceholder: 'PARTNER LOGO',
    isPlaceholder: true,
  },
  {
    id: 'brand-6',
    name: 'TECH BRAND F',
    category: 'Monitoring & Optimization',
    logoPlaceholder: 'PARTNER LOGO',
    isPlaceholder: true,
  },
];
