
// Defines the entire data structure for a single Visa Service

import { ProductMedia } from "./ProductAttributes";

export interface Requirements {
  personal: string[];
  work: string[];
  financial: string[];
  travel: string[];
}

export interface PricingEntry {
  // Dynamic key-value fields for a pricing entry
  [key: string]: string;
}

export interface Pricing {
  type: string;
  name: string;
  description?: string;
  prices: PricingEntry[];
}

export interface VisaType {
  id: string;
  name: string;
  requirements: Requirements;
  pricing: Pricing[];
}

export interface VisaService {
  id: string; // The slug, e.g., "china"
  continentSlug: string;
  slug: string;
  title: string;
  countryName: string;
  heroImage: string;
  successRate: string;
  processingTime: string;
  description: string;
  services: string[];
  visaTypes: VisaType[];
  media: ProductMedia[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Minimal type for table display
export interface VisaServiceSummary {
    id: string;
    title: string;
    countryName: string;
    successRate: string;
    processingTime: string;
    status: 'active' | 'inactive';
    createdAt: string;
}
