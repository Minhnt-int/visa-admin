// Init data constants for forms
import { NewsAttributes } from '@/data/News';
import { TourFormData } from '@/data/Tour';

// Init data cho NewsFormData
export const initNewsData: NewsAttributes = {
  id: 0,
  slug: '',
  title: '',
  content: '',
  excerpt: '',
  imageUrl: '',
  author: '',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  status: 'active',
  publishedAt: new Date().toISOString(),
  readTime: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Init data cho TourFormData
export const initTourData: TourFormData = {
  slug: '',
  name: '',
  categoryId: 1, // Default category
  country: '',
  duration: '',
  price: 0,
  originalPrice: 0,
  departure: [],
  image: '',
  gallery: [],
  rating: 0,
  reviewCount: 0,
  isHot: false,
  groupSize: { min: 1, max: 20 },
  highlights: [],
  itinerary: [],
  services: {
    included: [],
    excluded: []
  },
  terms: {
    registration: [],
    cancellation: [],
    payment: []
  },
  whyChooseUs: [],
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  status: 'active'
};

// Helper function để tạo deep copy của init data
export const createNewsInitData = (): NewsAttributes => ({
  ...initNewsData,
  publishedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

export const createTourInitData = (): TourFormData => ({
  ...initTourData
});
