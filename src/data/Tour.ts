// Tour data types for admin panel

export interface TourCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface GroupSize {
  min: number;
  max: number;
}

export interface Highlight {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals: string[];
  accommodation?: string;
}

export interface TourServices {
  included: string[];
  excluded: string[];
}

export interface TourTerms {
  registration: string[];
  cancellation: string[];
  payment: string[];
}

export interface WhyChooseUs {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Tour {
  id: number;
  slug: string;
  name: string;
  categoryId: number;
  category?: TourCategory;
  country: string;
  duration: string;
  price: number;
  originalPrice: number;
  departure: string[]; // JSON array
  image: string;
  gallery: string[]; // JSON array
  rating: number;
  reviewCount: number;
  isHot: boolean;
  groupSize: GroupSize; // JSON object
  highlights: Highlight[]; // JSON array
  itinerary: ItineraryDay[]; // JSON array
  services: TourServices; // JSON object
  terms: TourTerms; // JSON object
  whyChooseUs: WhyChooseUs[]; // JSON array
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface TourSummary {
  id: number;
  slug: string;
  name: string;
  categoryId: number;
  categoryName?: string;
  country: string;
  duration: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviewCount: number;
  isHot: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface TourFormData {
  id?: number;
  slug: string;
  name: string;
  categoryId: number;
  country: string;
  duration: string;
  price: number;
  originalPrice: number;
  departure: string[];
  image: string;
  gallery: string[];
  rating: number;
  reviewCount: number;
  isHot: boolean;
  groupSize: GroupSize;
  highlights: Highlight[];
  itinerary: ItineraryDay[];
  services: TourServices;
  terms: TourTerms;
  whyChooseUs: WhyChooseUs[];
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  status: 'active' | 'inactive';
}

