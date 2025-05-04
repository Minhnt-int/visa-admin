// ProductCategory Model
export interface ProductItemAttributes {
  id: number;
  name: string;
  price: number;
  salePrice: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface ProductMedia {
  id: number;
  url: string;
  type: 'image' | 'video';
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

// ProductCategory Model
export interface ProductAttributes {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  salePrice: number;
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