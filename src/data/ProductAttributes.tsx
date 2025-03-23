
interface ProductAttributes {
  id: number | null;
  name: string | null;
  price: number | null;
  description: string | null;
  categoryId: number | null;
  slug: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}