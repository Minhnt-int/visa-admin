
interface BlogPostAttributes {
  id: number;
  title: string;
  content: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  author: string;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  blogCategoryId: number; // Thêm trường blogCategoryId
}
