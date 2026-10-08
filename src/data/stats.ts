/**
 * SOCIO SOLAR SYSTEMS - Key Statistics & Metrics
 * 
 * Rules:
 * - Four items: 500+ Dealers Worldwide, 10+ Top Global Brands, 1000+ Projects Supported, 100% Commitment to Clean Energy
 * - Clearly structured as editable placeholder values.
 */

export interface StatItem {
  id: string;
  valueNumber: number;
  suffix: string;
  label: string;
  sublabel: string;
  iconName: 'Building' | 'Globe' | 'CheckCircle' | 'Sun';
  isPlaceholderValue: boolean;
}

export const STATS_DATA: StatItem[] = [
  {
    id: 'dealers',
    valueNumber: 500,
    suffix: '+',
    label: 'Dealers Worldwide',
    sublabel: 'Dedicated solar distribution network',
    iconName: 'Building',
    isPlaceholderValue: true,
  },
  {
    id: 'brands',
    valueNumber: 10,
    suffix: '+',
    label: 'Top Global Brands',
    sublabel: 'Vetted tier-1 product lines',
    iconName: 'Globe',
    isPlaceholderValue: true,
  },
  {
    id: 'projects',
    valueNumber: 1000,
    suffix: '+',
    label: 'Projects Supported',
    sublabel: 'Residential, commercial, and industrial arrays',
    iconName: 'CheckCircle',
    isPlaceholderValue: true,
  },
  {
    id: 'commitment',
    valueNumber: 100,
    suffix: '%',
    label: 'Commitment to Clean Energy',
    sublabel: 'Dedicated to sustainable energy transition',
    iconName: 'Sun',
    isPlaceholderValue: false,
  },
];
