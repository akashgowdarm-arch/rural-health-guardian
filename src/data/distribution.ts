/**
 * SOCIO SOLAR SYSTEMS - Distribution Process & Network Data
 * 
 * Rules:
 * - 6-step supply chain process: Sourcing -> Quality Check -> Warehousing -> Logistics -> Dealer/Installer -> Customer
 * - Do not invent geographic coverage; use placeholders where regions are unknown.
 */

export interface DistributionStep {
  stepNumber: number;
  title: string;
  description: string;
  iconName: 'Search' | 'CheckCircle2' | 'Warehouse' | 'Truck' | 'Users' | 'UserCheck';
}

export const DISTRIBUTION_STEPS: DistributionStep[] = [
  {
    stepNumber: 1,
    title: 'PRODUCT SOURCING',
    description: 'Direct procurement of tier-1 certified solar modules, inverters, and components directly from vetted global manufacturers.',
    iconName: 'Search',
  },
  {
    stepNumber: 2,
    title: 'QUALITY CHECK',
    description: 'Rigorous inspection protocols to confirm batch performance standards, physical integrity, and complete compliance.',
    iconName: 'CheckCircle2',
  },
  {
    stepNumber: 3,
    title: 'WAREHOUSING',
    description: 'Secure, climate-controlled staging facilities maintaining readily available buffer stock for rapid project fulfillment.',
    iconName: 'Warehouse',
  },
  {
    stepNumber: 4,
    title: 'LOGISTICS',
    description: 'Scheduled, trackable freight transport ensuring safe and timely delivery directly to project job sites or dealer hubs.',
    iconName: 'Truck',
  },
  {
    stepNumber: 5,
    title: 'DEALER / INSTALLER',
    description: 'Comprehensive distributor support for our network of certified solar installation partners, EPCs, and retail dealers.',
    iconName: 'Users',
  },
  {
    stepNumber: 6,
    title: 'CUSTOMER',
    description: 'Seamless power delivery to residential, commercial, and industrial end-users backed by long-term manufacturer warranties.',
    iconName: 'UserCheck',
  },
];

export interface DistributionPillar {
  title: string;
  description: string;
  placeholderNotice?: string;
}

export const DISTRIBUTION_PILLARS: DistributionPillar[] = [
  {
    title: 'Dealer Network',
    description: 'Empowering local solar professionals with dedicated stock allocations, trade credit terms, and reliable delivery cycles.',
    placeholderNotice: '[REGIONAL COVERAGE DETAILS TO BE UPDATED]',
  },
  {
    title: 'Product Availability',
    description: 'Strategic inventory buffers across major high-efficiency panel formats, hybrid inverters, and mounting structures.',
  },
  {
    title: 'Logistics Support',
    description: 'Coordinated end-to-end transport network with specialized heavy-handling fleets designed for fragile PV glass and high-voltage gear.',
  },
  {
    title: 'Technical Support',
    description: 'On-demand pre-sales sizing, engineering document packs, warranty RMA processing, and technical onboarding for new partners.',
  },
  {
    title: 'Partner Support',
    description: 'Marketing collateral, co-branded technical literature, and streamlined digital quote generation for our registered dealers.',
  },
];
