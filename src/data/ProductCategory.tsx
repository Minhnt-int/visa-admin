export interface ProductCategory {
  id?: number;
  name: string;
  slug: string;
  description: string;
  parentId: number | null;
  avatarUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}