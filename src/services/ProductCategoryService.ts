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
}

export const changeProductStatus = async (productId: number, status: string) => {
 try {
   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${PRODUCT_CATEGORIES_URL}/update-status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: productId,
      status: status
    }),
  });
   
   return await response.json();
 } catch (error: any) {
   console.error(`Lỗi khi thay đổi trạng thái sản phẩm:`, error);
   return { success: false, message: 'Đã xảy ra lỗi khi thay đổi trạng thái sản phẩm.' };
 }
};

export default new ProductCategoryService(); 