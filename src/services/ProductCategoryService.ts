import ApiService from './ApiService';
import { ProductCategory } from '@/data/ProductCategory';

const PRODUCT_CATEGORIES_URL = '/api/product-categories';

const ProductCategoryService = {
  /**
   * Lấy danh sách tất cả danh mục sản phẩm
   */
  async getAllCategories() {
    try {
      const response = await ApiService.get(PRODUCT_CATEGORIES_URL + "/get-list" +'?page=1&limit=10&sortBy=createdAt&sortOrder=DESC');
      return ApiService.handleResponse<ProductCategory[]>(response);
    } catch (error) {
      return ApiService.handleError(error);
    }
  },

  /**
   * Lấy danh mục sản phẩm theo ID
   */
  async getCategoryById(id: number) {
    try {
      const response = await ApiService.get(`${PRODUCT_CATEGORIES_URL}/${id}`);
      return ApiService.handleResponse<ProductCategory>(response);
    } catch (error) {
      return ApiService.handleError(error);
    }
  },

  /**
   * Tạo danh mục sản phẩm mới
   */
  async createCategory(category: ProductCategory) {
    try {
      const response = await ApiService.post(PRODUCT_CATEGORIES_URL, category);
      return ApiService.handleResponse<ProductCategory>(response);
    } catch (error) {
      return ApiService.handleError(error);
    }
  },

  /**
   * Cập nhật danh mục sản phẩm
   */
  async updateCategory(id: number, category: ProductCategory) {
    try {
      const response = await ApiService.put(`${PRODUCT_CATEGORIES_URL}/${id}`, category);
      return ApiService.handleResponse<ProductCategory>(response);
    } catch (error) {
      return ApiService.handleError(error);
    }
  },

  /**
   * Xóa danh mục sản phẩm
   */
  async deleteCategory(id: number) {
    try {
      const response = await ApiService.delete(`${PRODUCT_CATEGORIES_URL}/${id}`);
      return ApiService.handleResponse<any>(response);
    } catch (error) {
      return ApiService.handleError(error);
    }
  }
};

export default ProductCategoryService; 