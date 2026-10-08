/**
 * SOCIO SOLAR SYSTEMS - Solutions Data
 * 
 * Solutions for Residential, Commercial, Industrial, and EPC & Installer Support.
 */

export interface SolarSolution {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  fullDetails: string;
  iconName: 'Home' | 'Building2' | 'Factory' | 'Wrench';
  image: string;
  benefits: string[];
}

export const SOLAR_SOLUTIONS: SolarSolution[] = [
  {
    id: 'residential-solar',
    title: 'RESIDENTIAL SOLAR',
    subtitle: 'Clean energy solutions for homes.',
    description: 'Clean energy solutions for homes. Reduce electricity bills, achieve energy independence, and power your household with clean solar power.',
    fullDetails: 'We supply certified residential solar components including high-efficiency rooftop panels, compact residential hybrid inverters, and safe lithium home storage systems designed for quick installation and reliable 24/7 power.',
    iconName: 'Home',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
    benefits: [
      'Significant reduction in monthly utility bills',
      'Reliable power backup during grid outages',
      'Clean energy independence for your household',
      'Long system lifespan with minimal maintenance',
    ],
  },
  {
    id: 'commercial-solar',
    title: 'COMMERCIAL SOLAR',
    subtitle: 'Solar solutions for businesses and commercial buildings.',
    description: 'Solar solutions for businesses and commercial buildings. Offset operational overhead and satisfy sustainability targets with smart solar arrays.',
    fullDetails: 'Turn unutilized commercial roof and carport space into power-generating assets. We provide high-output commercial tier panels, three-phase grid-tied string inverters, and balance-of-system components built for corporate uptime.',
    iconName: 'Building2',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
    benefits: [
      'Lower operational costs and tax incentives',
      'Measurable ESG and sustainability progress',
      'Predictable long-term levelized cost of energy',
      'Scalable designs suitable for corporate campuses',
    ],
  },
  {
    id: 'industrial-solar',
    title: 'INDUSTRIAL SOLAR',
    subtitle: 'Scalable solar solutions for industrial requirements.',
    description: 'Scalable solar solutions for industrial requirements. High-capacity distributed generation and energy storage for heavy manufacturing.',
    fullDetails: 'Designed to handle demanding industrial load profiles and multi-megawatt configurations. Our distribution inventory covers heavy-duty structural steel mounts, utility-scale inverters, and containerized battery energy storage systems.',
    iconName: 'Factory',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80',
    benefits: [
      'Peak demand shaving to mitigate high tariff rates',
      'Resilient uninterrupted industrial power supply',
      'High-capacity power conversion architectures',
      'Engineered for harsh industrial operating environments',
    ],
  },
  {
    id: 'epc-installer-support',
    title: 'EPC & INSTALLER SUPPORT',
    subtitle: 'Products and support for solar professionals.',
    description: 'Products and support for solar professionals. Bulk product supply, rapid warehousing dispatch, engineering documentation, and warranty support.',
    fullDetails: 'SOCIO Solar Systems is dedicated to empowering EPC contractors and certified installers. From project BOM verification and logistics coordination to warranty facilitation and technical training, we are your distribution backbone.',
    iconName: 'Wrench',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=80',
    benefits: [
      'Priority volume pricing and flexible terms',
      'Centralized warehousing and scheduled site dispatch',
      'Datasheet, single-line diagrams, and warranty backing',
      'Dedicated technical liaison for project execution',
    ],
  },
];
