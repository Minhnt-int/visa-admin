
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

// API Response interface (snake_case from backend)
export interface VisaServiceApiResponse {
  id: number;
  slug: string;
  continent_slug: string;
  title: string;
  country_name: string;
  hero_image: string;
  success_rate: string;
  processing_time: string;
  description: string;
  services: string[];
  visa_types: VisaType[];
  media: ProductMedia[];
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// Form interface (camelCase for frontend)
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
    id: number; // Database ID
    slug: string; // URL slug
    title: string;
    countryName: string;
    successRate: string;
    processingTime: string;
    status: 'active' | 'inactive';
    createdAt: string;
}

// Utility function to convert API response to form data
export const mapApiResponseToVisaService = (apiData: VisaServiceApiResponse): VisaService => {
  return {
    id: apiData.slug, // Use slug as id for form
    continentSlug: apiData.continent_slug,
    slug: apiData.slug,
    title: apiData.title,
    countryName: apiData.country_name,
    heroImage: apiData.hero_image,
    successRate: apiData.success_rate,
    processingTime: apiData.processing_time,
    description: apiData.description,
    services: apiData.services,
    visaTypes: apiData.visa_types,
    media: apiData.media,
    status: apiData.status,
    createdAt: apiData.created_at,
    updatedAt: apiData.updated_at,
  };
};
