import { ProductAttributes, ProductMedia } from '@/data/ProductAttributes';


interface ProductFormData {
  id?: number;
  name: string;
  slug: string;
  categoryId: number;
  description: string;
  media: ProductMedia[];
  items: Array<{
    name: string;
    color: string;
    price: number;
    originalPrice: number;
    status: 'available' | 'out_of_stock';
  }>;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const convertToFormData = (product: ProductAttributes | null): ProductFormData => {
  if (!product) {
    return {
      name: '',
      slug: '',
      categoryId: 0,
      description: '',
      media: [],
      items: [],
      metaTitle: '',
      metaDescription: '',
      metaKeywords: ''
    };
  }

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    categoryId: product.categoryId,
    description: product.description || '',
    media: product?.media?.map(media => ({
      id: Date.now(),
      name: media.url.split('/').pop() || '',
      url: media.url,
      type: media.type,
      altText: '',
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
      productId: product.id,
      mediaId: media.id || Date.now()
    })),
    items: product?.items?.map(item => ({
      name: item.name,
      color: item.color,
      price: item.price,
      originalPrice: item.originalPrice,
      status: item.status as 'available' | 'out_of_stock'
    })),
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    metaKeywords: product.metaKeywords,
    createdAt: product.createdAt ? new Date(product.createdAt) : undefined,
    updatedAt: product.updatedAt ? new Date(product.updatedAt) : undefined
  };
}; 