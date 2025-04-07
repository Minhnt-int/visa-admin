import ApiService from './ApiService';
import { BlogCategory } from '@/data/blogCategory';

const BLOG_CATEGORIES_URL = '/api/blog-categories';

const BlogCategoryService = {
  /**
   * Lấy danh sách tất cả danh mục blog
   */
  async getAllCategories() {
    try {
      const response = await ApiService.get(BLOG_CATEGORIES_URL);
      return ApiService.handleResponse<BlogCategory[]>(response);
    } catch (error) {
      return ApiService.handleError(error);
    }
  },

  /**
   * Lấy danh mục blog theo ID
   */
  async getCategoryById(id: number) {
    try {
      const response = await ApiService.get(`${BLOG_CATEGORIES_URL}/${id}`);
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
  async updateCategory(id: number, category: BlogCategory) {
    try {
      const response = await ApiService.put(`${BLOG_CATEGORIES_URL}/${id}`, category);
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
  }
};

export default BlogCategoryService; 