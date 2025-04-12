import ApiService from './ApiService';
import { ProductCategory } from '@/data/ProductCategory';

const PRODUCT_CATEGORIES_URL = '/api/product-category';

const ProductCategoryService = {
  /**
   * Lấy danh sách tất cả danh mục sản phẩm
   */
  async getAllCategories(params?: {
    page?: number;
    limit?: number;
    name?: string;
    parentId?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params) {
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.name) queryParams.append('name', params.name);
        if (params.parentId) queryParams.append('parentId', params.parentId.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      }

      const url = `${PRODUCT_CATEGORIES_URL}/get-list${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await ApiService.get(url);
      return ApiService.handleResponse<ProductCategory[]>(response);
    } catch (error) {
      return ApiService.handleError(error);
    }
  },

  /**
   * Lấy danh mục sản phẩm theo ID
   */

  /**
   * Tạo danh mục sản phẩm mới
   */
  async createCategory(category: ProductCategory) {
    try {
      const response = await ApiService.post(`${PRODUCT_CATEGORIES_URL}/create-category`, category);
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
      const response = await ApiService.put(`${PRODUCT_CATEGORIES_URL}/update-category`, category);
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