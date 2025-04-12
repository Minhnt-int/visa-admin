// ProductCategory Model
export interface ProductItemAttributes {
  id: number;
  name: string;
  color: string;
  price: number;
  originalPrice: number;
  status: 'available' | 'out_of_stock';
}

export interface ProductMedia {
  id: number;
  productId: number;
  name: string;
  url: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  mediaId: number;
  altText: string;
}

// ProductCategory Model
export interface ProductAttributes {
  id: number;
  name: string;
  description?: string;
  shortDescription?: string;
  categoryId: number;
  avatarUrl?: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
  items: ProductItemAttributes[];
  media: ProductMedia[];
}