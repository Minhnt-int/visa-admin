export interface ProductVariant {
  id: number;
  name: string;
  sku: string;
  price: number;
  originalPrice: number;
  stock: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
} 