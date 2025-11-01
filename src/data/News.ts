// News data types for admin panel

export interface News {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  author: string;
  publishedAt: string; // ISO date string
  readTime: number; // in minutes
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface NewsSummary {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  author: string;
  publishedAt: string;
  date?: string; // Backend trả về date thay vì publishedAt
  readTime: number;
  metaKeywords: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface NewsFormData {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  author: string;
  publishedAt: string;
  readTime: number;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  status: 'active' | 'inactive';
}

export interface NewsAttributes extends NewsFormData {
  id: number;
  createdAt: string;
  updatedAt: string;
}

