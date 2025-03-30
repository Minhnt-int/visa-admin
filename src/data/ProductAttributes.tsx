

// ProductCategory Model
export interface ProductItemAttributes {
  name: string;
  color: string;
  price: number;
  originalPrice: number;
  status: string;

}


export interface ProductMedia {
  type: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

// ProductCategory Model
export interface ProductAttributes {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  createdAt?: Date;
  updatedAt?: Date;
  items: ProductItemAttributes[];
  media: ProductMedia[];
}