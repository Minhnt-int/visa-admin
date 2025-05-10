// ProductCategory Model
export interface ProductItemAttributes {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  color: string;
}

export interface ProductMedia {
  id: number;
  url: string;
  type: 'image' | 'video';
  createdAt: string;
  updatedAt: string;
  productId: number;
  altText?: string;
  name?: string;
}

// ProductCategory Model
export interface ProductAttributes {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  status: 'active' | 'inactive' | 'draft';
  categoryId: number;
  avatarUrl: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  createdAt: string;
  updatedAt: string;
  items: ProductItemAttributes[];
  media: ProductMedia[];
}