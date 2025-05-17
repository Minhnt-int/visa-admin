export interface MetaSEOAttributes {
  id: number;
  pageKey: string;
  pageUrl?: string;
  title: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  customHead?: string;
  createdAt?: Date;
  updatedAt?: Date;
}