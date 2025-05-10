

  export class BlogCategory {
  public id!: number;
  public name!: string;
  public slug!: string;
  public avatarUrl!: string;
  public status!: typeof BlogStatus[keyof typeof BlogStatus];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  }
  export const initBlogCategory = {
    id: 0,
    name: '',
    slug: '',
    avatarUrl: '',
    status: 'active',
    parentId: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  
export const BlogStatus = {
  DRAFT: 'draft',      // Nháp
  ACTIVE: 'active',    // Hoạt động
  DELETED: 'deleted'   // Đã xóa
};