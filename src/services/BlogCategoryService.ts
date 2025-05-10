import ApiService from './ApiService';
import { BlogCategory } from '@/data/blogCategory';

const BLOG_CATEGORIES_URL = '/api/blog-categories';
const BLOG_CATEGORY_URL = '/api/blog/category';

const BlogCategoryService = {
  /**
   * Lấy danh sách tất cả danh mục blog
   */
  async getAllCategories(params?: {
    page?: number;
    limit?: number;
    status?: string;
    name?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params) {
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.status) queryParams.append('status', params.status);
          else queryParams.append('status', 'all'); // Mặc định là active
        if (params.name) queryParams.append('name', params.name);
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      }

      const url = `${BLOG_CATEGORIES_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await ApiService.get(url);
      return ApiService.handleResponse<BlogCategory[]>(response);
    } catch (error) {
      return ApiService.handleError(error);
    }
  },

  /**
   * Lấy danh mục blog theo ID
   */
  async getCategoryBySlug(slug: string) {
    try {
      const response = await ApiService.get(`${BLOG_CATEGORY_URL}/${slug}`);
      return ApiService.handleResponse<BlogCategory>(response);
    } catch (error) {
      return ApiService.handleError(error);
    }
  },

  /**
   * Tạo danh mục blog mới
   */
  async createCategory(category: BlogCategory) {
    try {
      const response = await ApiService.post(BLOG_CATEGORIES_URL, category);
      return ApiService.handleResponse<BlogCategory>(response);
    } catch (error) {
      return ApiService.handleError(error);
    }
  },

  /**
   * Cập nhật danh mục blog
   */
  async updateCategory(category: BlogCategory) {
    try {
      const response = await ApiService.put(`${BLOG_CATEGORIES_URL}`, category);
      return ApiService.handleResponse<BlogCategory>(response);
    } catch (error) {
      return ApiService.handleError(error);
    }
  },

  /**
   * Xóa danh mục blog
   */
  async deleteCategory(id: number) {
    try {
      const response = await ApiService.delete(`${BLOG_CATEGORIES_URL}/${id}`);
      return ApiService.handleResponse<any>(response);
    } catch (error) {
      return ApiService.handleError(error);
    }
  },

  async changeBlogCategoryStatus(id: number, status: string) {
    try {
      const response = await ApiService.put(`${BLOG_CATEGORIES_URL}/change-status`, {id,  status});
      return ApiService.handleResponse<BlogCategory>(response);
    } catch (error) {
      return ApiService.handleError(error);
    }
  }
};

export default BlogCategoryService; 