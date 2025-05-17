export interface ProductCategory {
  id: number;
  name: string;
  parentId: number | null;
  status: 'active' | 'deleted';
  slug: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
  avatarUrl: string;
} 
