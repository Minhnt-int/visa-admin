export interface ProductCategory {
  id: number;
  name: string;
  parentId: number | null;
  slug: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
  avatarUrl: string;
} 
