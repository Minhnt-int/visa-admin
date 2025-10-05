
// Defines the entire data structure for a single Visa Service

import { ProductMedia } from "./ProductAttributes";

export interface WorkRequirement {
  type: string;
  docs: string[];
}

export interface Requirements {
  personal: string[];
  work: WorkRequirement[];
  financial: string[];
  travel: string[];
}

export interface VisaType {
  id: string;
  name: string;
  requirements: Requirements;
}

export interface PriceDetail {
  adult: string;
  child_6_12: string;
  child_under_6: string;
  consularFee: string;
  serviceFee: string;
  note: string;
}

export interface Pricing {
  type: string;
  name: string;
  description: string;
  validity: string;
  stayDuration: string;
  processingTime: string;
  prices: PriceDetail[];
}

export interface Testimonial {
  id: string;
  name: string;
  quote: string;
  rating: number;
  image: string;
}

export interface RelatedArticle {
  id: string;
  title: string;
  url: string;
  image: string;
}

export interface VisaService {
  id: string; // The slug, e.g., "china"
  continentSlug: string;
  title: string;
  countryName: string;
  heroImage: string;
  successRate: string;
  processingTime: string;
  description: string;
  services: string[];
  visaTypes: VisaType[];
  pricing: Pricing[];
  testimonials: Testimonial[];
  relatedArticles: RelatedArticle[];
  media: ProductMedia[];
  status: 'published' | 'draft' | 'deleted';
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
    status: 'published' | 'draft' | 'deleted';
    createdAt: string;
}
