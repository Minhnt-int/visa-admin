import { ProductCategory } from '@/data/ProductCategory';
import ApiService from './ApiService';

const PRODUCT_CATEGORIES_URL = '/api/product-category';

class ProductCategoryService {
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
    status?: string;
    search?: string;
  }) {
    try {
      const response = await ApiService.get(PRODUCT_CATEGORIES_URL, params);
      return ApiService.handleResponse<ProductCategory[]>(response);
    } catch (error) {
      return ApiService.handleError(error);
    }
  }

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
  }

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
  }

  /**
   * Cập nhật danh mục sản phẩm
   */
  async updateCategory(id: number, category: ProductCategory) {
    try {
      const response = await ApiService.post(`${PRODUCT_CATEGORIES_URL}/update-category`, category);
      return ApiService.handleResponse<ProductCategory>(response);
    } catch (error) {
      return ApiService.handleError(error);
    }
  }

  /**
   * Xóa danh mục sản phẩm
   */
  async deleteCategory(id: number) {
    try {
      const response = await ApiService.delete(`${PRODUCT_CATEGORIES_URL}/delete-category?id=${id}`);
      return ApiService.handleResponse<any>(response);
    } catch (error) {
      return ApiService.handleError(error);
    }
  }
  async changeProductCategoryStatus (productId: number, status: string) {
  try {
    const response = await ApiService.post(`${PRODUCT_CATEGORIES_URL}/update-status`, {
      id: productId,
      status: status
    });
    return ApiService.handleResponse(response);
  } catch (error) {
    return ApiService.handleError(error);
  }
};
}



export default new ProductCategoryService();