/**
 * SOCIO SOLAR SYSTEMS - Product Catalog Data
 * 
 * Rules:
 * - Placeholder descriptions and imagery are editable.
 * - Technical specifications must NOT be invented; they default to "Specifications to be updated"
 *   until real vendor datasheets are supplied.
 */

export type ProductCategory = 
  | 'Solar Panels' 
  | 'Inverters' 
  | 'Batteries' 
  | 'Structures' 
  | 'Accessories';

export interface ProductItem {
  id: string;
  name: string;
  category: ProductCategory;
  tagline: string;
  shortDescription: string;
  overview: string;
  image: string;
  features: string[];
  applications: string[];
  specsPlaceholder: string;
  badge?: string;
  featured?: boolean;
}

export const PRODUCT_CATEGORIES: ('All' | ProductCategory)[] = [
  'All',
  'Solar Panels',
  'Inverters',
  'Batteries',
  'Structures',
  'Accessories',
];

export const PRODUCTS: ProductItem[] = [
  // 1. SOLAR PANELS
  {
    id: 'solar-panels-mono',
    name: 'High-Efficiency Monocrystalline Modules',
    category: 'Solar Panels',
    tagline: 'Tier-1 High Output Photovoltaic Modules',
    shortDescription: 'High efficiency solar modules for reliable energy generation.',
    overview: 'Engineered for optimal performance in high-temperature environments, offering high power density, superior low-light response, and robust mechanical loading endurance.',
    image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1000&q=80',
    features: [
      'High conversion efficiency architecture',
      'Anti-reflective and anti-soiling surface design',
      'Heavy snow load and wind load resistance',
      'Minimal annual power degradation rate',
    ],
    applications: [
      'Residential rooftop installations',
      'Commercial & Industrial solar carports',
      'Utility-scale ground mounted arrays',
    ],
    specsPlaceholder: 'Specifications to be updated',
    badge: 'Popular',
    featured: true,
  },
  {
    id: 'solar-panels-bifacial',
    name: 'Bifacial Dual-Glass Solar Modules',
    category: 'Solar Panels',
    tagline: 'Dual-Sided Energy Capture Technology',
    shortDescription: 'Dual-surface solar panels capturing direct sunlight and ground albedo reflection.',
    overview: 'Double-glass bifacial modules harness irradiance from both faces to increase total energy yield by up to 25%, ideal for reflective surfaces and utility fields.',
    image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=1000&q=80',
    features: [
      'Bifaciality coefficient exceeding industry benchmarks',
      'Dual glass encapsulation for extended lifespan',
      'Superior resistance to PID and micro-cracking',
      'Optimized for tracker and elevated installations',
    ],
    applications: [
      'Industrial flat roofs',
      'Ground mount solar parks',
      'Agrivoltaic systems',
    ],
    specsPlaceholder: 'Specifications to be updated',
    featured: true,
  },

  // 2. SOLAR INVERTERS
  {
    id: 'solar-inverters-string',
    name: 'Smart Hybrid Grid-Tie Inverters',
    category: 'Inverters',
    tagline: 'Intelligent Energy Conversion & Management',
    shortDescription: 'Reliable and smart power conversion solutions.',
    overview: 'Advanced inverter platforms designed for seamless grid synchronization, battery integration, and cloud-enabled digital yield tracking.',
    image: 'https://images.unsplash.com/photo-1558441719-8b489c63a79b?auto=format&fit=crop&w=1000&q=80',
    features: [
      'High MPPT tracking efficiency',
      'Integrated DC disconnect and surge protection',
      'Quiet natural cooling / intelligent fan architecture',
      'Remote monitoring app and portal support',
    ],
    applications: [
      'Residential self-consumption',
      'Commercial net-metered installations',
      'Hybrid backup power stations',
    ],
    specsPlaceholder: 'Specifications to be updated',
    badge: 'Smart MPPT',
    featured: true,
  },
  {
    id: 'solar-inverters-commercial',
    name: 'Three-Phase Commercial Inverters',
    category: 'Inverters',
    tagline: 'High-Capacity Power Conversion for Facilities',
    shortDescription: 'High-power three-phase inverters optimized for large-scale enterprise arrays.',
    overview: 'Built for industrial applications with multiple MPP trackers, high input currents to support modern high-power modules, and integrated AC/DC type II SPDs.',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1000&q=80',
    features: [
      'Multi-MPPT configuration for complex roofs',
      'IP66 weather-resistant enclosure rating',
      'Intelligent I-V curve diagnosis capability',
      'Grid support and reactive power control',
    ],
    applications: [
      'Factories and manufacturing plants',
      'Shopping complexes & distribution hubs',
      'Institutional campuses',
    ],
    specsPlaceholder: 'Specifications to be updated',
  },

  // 3. SOLAR BATTERIES
  {
    id: 'solar-batteries-lithium',
    name: 'High-Voltage Lithium Storage Systems',
    category: 'Batteries',
    tagline: 'Long-Cycle Energy Storage Solutions',
    shortDescription: 'Long-lasting energy storage solutions.',
    overview: 'Modular Lithium Iron Phosphate (LiFePO4) battery systems engineered for deep cycling, thermal stability, and expandable modular capacity.',
    image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1000&q=80',
    features: [
      'Safe LiFePO4 chemical composition',
      'Modular rack/stack design for scalable capacity',
      'Integrated intelligent Battery Management System (BMS)',
      'Rapid charge and discharge rate capability',
    ],
    applications: [
      'Residential peak shaving and backup',
      'Off-grid remote energy microgrids',
      'Commercial peak demand mitigation',
    ],
    specsPlaceholder: 'Specifications to be updated',
    badge: 'LiFePO4',
    featured: true,
  },
  {
    id: 'solar-batteries-commercial-ess',
    name: 'Commercial & Industrial Battery ESS',
    category: 'Batteries',
    tagline: 'Containerized & Cabinet Scalable Storage',
    shortDescription: 'Robust energy storage systems designed for commercial resilience.',
    overview: 'Complete containerized and cabinet storage units equipped with active fire suppression, temperature management, and smart dispatch software.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80',
    features: [
      'Integrated HVAC and environmental control',
      'Multi-tier BMS with cloud health telemetry',
      'High round-trip conversion efficiency',
      'Plug-and-play installation format',
    ],
    applications: [
      'Industrial backup infrastructure',
      'Renewable capacity firming',
      'EV charging station buffer',
    ],
    specsPlaceholder: 'Specifications to be updated',
  },

  // 4. MOUNTING STRUCTURES
  {
    id: 'mounting-structures-roof',
    name: 'Aluminum Rooftop Mounting Systems',
    category: 'Structures',
    tagline: 'Corrosion-Resistant Precision Engineered Racks',
    shortDescription: 'Durable and safe mounting solutions for solar installations.',
    overview: 'Anodized architectural aluminum rails and stainless steel clamps tested for extreme wind and seismic loads, ensuring structural integrity on metal, tile, and concrete roofs.',
    image: 'https://images.unsplash.com/photo-1548611716-ad3833d7591c?auto=format&fit=crop&w=1000&q=80',
    features: [
      'High-grade anodized aluminum (AL6005-T5)',
      'Pre-assembled components for rapid site assembly',
      'Universal clamps adaptable to diverse module thicknesses',
      'Zero-penetration ballasted options for flat roofs',
    ],
    applications: [
      'Pitched tiled and metal roofs',
      'Commercial concrete flat rooftops',
      'Solar sheds and carports',
    ],
    specsPlaceholder: 'Specifications to be updated',
    featured: true,
  },
  {
    id: 'mounting-structures-ground',
    name: 'Hot-Dip Galvanized Ground Mounts',
    category: 'Structures',
    tagline: 'Heavy-Duty Ground Foundation Systems',
    shortDescription: 'Engineered structural foundations for open-field and utility installations.',
    overview: 'Corrosion-protected hot-dip galvanized steel structures designed for ramming or concrete screw piles across variable soil topographies.',
    image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1000&q=80',
    features: [
      'Hot-dip galvanized coating for decades of rust prevention',
      'Adjustable tilt angle configurations',
      'Compatible with single and dual-row portrait layouts',
      'Engineered for high wind velocity resistance',
    ],
    applications: [
      'Commercial ground mount projects',
      'Large solar utility farms',
      'Agricultural installations',
    ],
    specsPlaceholder: 'Specifications to be updated',
  },

  // 5. SOLAR ACCESSORIES
  {
    id: 'solar-accessories-cables',
    name: 'Solar DC Cables & MC4 Connectors',
    category: 'Accessories',
    tagline: 'Reliable Connectivity & Electrical Components',
    shortDescription: 'Cables, connectors and essential solar components.',
    overview: 'TUV/UL certified cross-linked polyethylene (XLPO) DC solar cables and weather-sealed MC4 compatible connectors engineered for UV and ozone resistance.',
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1000&q=80',
    features: [
      'Halogen-free, flame retardant UV-resistant insulation',
      'Low contact resistance precision crimp connectors',
      'IP68 waterproof seal rating',
      'High temperature thermal operational threshold',
    ],
    applications: [
      'Module-to-inverter string wiring',
      'Outdoor combiner box interconnections',
      'Substation and balance of system setups',
    ],
    specsPlaceholder: 'Specifications to be updated',
    featured: true,
  },
  {
    id: 'solar-accessories-combiner',
    name: 'DC Combiner Boxes & SPD Protectors',
    category: 'Accessories',
    tagline: 'Array Safety & Circuit Protection Assemblies',
    shortDescription: 'Enclosed circuit protection and monitoring solutions.',
    overview: 'Custom-built DC combiner boxes equipped with high-voltage DC fuses, disconnect switches, and class II surge protection devices (SPDs).',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80',
    features: [
      'Waterproof and dustproof IP65 polycarbonate/steel enclosures',
      'High DC voltage rating up to 1000V/1500V',
      'String current monitoring options',
      'Fast-acting DC disconnect switches',
    ],
    applications: [
      'Commercial multi-string systems',
      'Industrial rooftop isolation',
      'Utility array field combiners',
    ],
    specsPlaceholder: 'Specifications to be updated',
  },
];
