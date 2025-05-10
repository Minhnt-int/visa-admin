export interface BlogPostAttributes {
  id: number;
  title: string;
  avatarUrl: string;
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
  status: 'active' | 'draft' | 'deleted';
}

export const initBlog = {
  id: 0,
  title: '',
  avatarUrl: '',
  content: '',
  slug: '',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  author: '',
  publishedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  blogCategoryId: 0, // Thêm trường blogCategoryId
  status: 'draft' as const
};
