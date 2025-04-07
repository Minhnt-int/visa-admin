export class BlogCategory {
    public id!: number;
    public name!: string;
    public slug!: string;
    public avatarUrl!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
  }
  export const initBlogCategory = {
    id: 0,
    name: '',
    slug: '',
    avatarUrl: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };