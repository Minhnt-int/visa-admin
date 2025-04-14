/**
 * Service cho các cuộc gọi API liên quan đến sản phẩm
 */

import axios, { AxiosResponse } from 'axios';
import { ProductAttributes } from '@/data/ProductAttributes';
import { ProductCategory } from '@/data/ProductCategory';

// Tạo axios instance với cấu hình cơ bản
const axioss = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache cho API responses
const apiCache = new Map();

// Thời gian cache (mili giây)
const CACHE_DURATION = 30 * 1000; // 30 giây

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Hàm helper để cache và memoize API responses
const cacheApiResponse = (key: string, promise: Promise<any>) => {
  // Nếu có trong cache và chưa hết hạn, trả về từ cache
  if (apiCache.has(key)) {
    const cachedData = apiCache.get(key);
    if (cachedData.timestamp > Date.now() - CACHE_DURATION) {
      return Promise.resolve(cachedData.data);
    }
  }

  // Không có trong cache hoặc hết hạn, thực hiện API call
  return promise.then(response => {
    apiCache.set(key, {
      timestamp: Date.now(),
      data: response
    });
    return response;
  });
};

// Thêm intercept hỗ trợ memoize
axioss.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xóa cache nếu request gặp lỗi để tránh lưu trữ dữ liệu không hợp lệ
    return Promise.reject(error);
  }
);

// Define response types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  message: string;
  pagination?: {
    total: number;
    totalPages: number;
  };
}

// Define query parameters type
export interface ProductQueryParams {
  categoryId?: number | string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
  status?: 'draft' | 'active' | 'deleted';
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Lấy danh sách sản phẩm dựa trên các tham số được cung cấp
 */
export const fetchProductList = async ({
  categoryId = '',
  search = '',
  sortBy = '',
  sortOrder = 'DESC',
  page = 1,
  limit = 12,
  status = 'active',
  minPrice,
  maxPrice
}: ProductQueryParams = {}): Promise<ApiResponse<ProductAttributes[]>> => {
  try {
    const params = {
      categoryId: categoryId ? String(categoryId) : '',
      search: search || '',
      sortBy: sortBy || '',
      sortOrder: sortOrder || 'DESC',
      page: page || 1,
      limit: limit || 12,
      status: status || 'active',
      minPrice: minPrice ? String(minPrice) : undefined,
      maxPrice: maxPrice ? String(maxPrice) : undefined
    };
    
    // Lọc bỏ các tham số trống
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => 
        value !== undefined && value !== null && value !== ''
      )
    );
    
    const response = await axioss.get(`${API_BASE_URL}/api/product/get-list`, {
      params: filteredParams,
      validateStatus: function (status) {
        // Chấp nhận mã trạng thái 200-299 là thành công
        return status >= 200 && status < 300;
      }
    });
    
    // Ensure response includes success, data, and pagination fields
    const responseData = response.data;
    return {
      success: response.status >= 200 && response.status < 300,
      data: responseData.data || [],
      pagination: responseData.pagination || { total: 0, totalPages: 0 },
      message: responseData.message || ''
    };
  } catch (error: any) {
    console.error("Lỗi khi lấy sản phẩm:", error);
    return {
      success: false,
      data: [],
      pagination: { total: 0, totalPages: 0 },
      message: error.message || 'Failed to fetch products'
    };
  }
};

/**
 * Lấy thông tin chi tiết sản phẩm theo slug
 * @param {string} slug - Slug của sản phẩm
 * @returns {Promise<Object>} - Promise trả về dữ liệu sản phẩm
 */
export const fetchProductBySlug = async (slug: string) => {
  try {
    const response = await axioss.get(`${API_BASE_URL}/api/product/get-product-by-slug`, {
      params: { slug },
      validateStatus: function (status) {
        // Chấp nhận mã trạng thái 200-299 là thành công
        return status >= 200 && status < 300;
      }
    });
    
    return {
      ...response,
      data: {
        success: response.status >= 200 && response.status < 300,
        data: response.data?.data || null,
        message: response.data?.message || ''
      }
    };
  } catch (error: any) {
    console.error(`Lỗi khi lấy thông tin sản phẩm với slug ${slug}:`, error);
    return {
      data: {
        success: false,
        data: null,
        message: error.message || `Failed to fetch product with slug: ${slug}`
      }
    };
  }
};

/**
 * Lấy danh sách sản phẩm phổ biến
  * @returns {Promise<Array>} - Promise trả về danh sách sản phẩm phổ biến
 */
export const fetchPopularProducts = async (

) => {
  // Trả về mảng rỗng để vô hiệu hóa tạm thời
  console.log("fetchPopularProducts đã bị vô hiệu hóa, trả về mảng rỗng");
  return [];
};

/**
 * Lấy danh sách danh mục sản phẩm
 * @param {number} page - Số trang
 * @param {number} limit - Số mục mỗi trang
 * @returns {Promise<Object>} - Promise trả về dữ liệu danh mục sản phẩm
 */
export const fetchProductCategories = async (page = 1, limit = 10,  search = '',
  sortBy = '',
  sortOrder = '') => {
  try {
    const response = await axioss.get(`${API_BASE_URL}/api/product-category/get-list`, {
      params: { page, limit,
        search,
        sortBy,
        sortOrder,
       },
      validateStatus: function (status) {
        // Chấp nhận mã trạng thái 200-299 là thành công
        return status >= 200 && status < 300;
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin loại sản phẩm:`, error);
    throw error;
  }
};

export const createProduct = async (productData: ProductAttributes) => {
  try {
    const response = await axioss.post(`${API_BASE_URL}/api/product/create`, productData, {
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: function (status) {
        // Chấp nhận mã trạng thái 200 và 201 là thành công
        return status >= 200 && status < 300;
      }
    });
    
    return {
      success: response.status >= 200 && response.status < 300,
      data: response.data?.data || null,
      message: response.data?.message || 'Product created successfully'
    };
  } catch (error) {
    console.error('Lỗi khi tạo sản phẩm:', error);
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Failed to create product'
    };
  }
};

/**
 * Cập nhật thông tin sản phẩm
 * @param {ProductAttributes} productData - Dữ liệu sản phẩm cần cập nhật
 * @returns {Promise<Object>} - Promise trả về kết quả cập nhật sản phẩm
 */
export const updateProduct = async (productData: ProductAttributes ) => {
  try {
    const response = await axioss.put(`${API_BASE_URL}/api/product/update`, productData, {
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: function (status) {
        // Chấp nhận mã trạng thái 200 và 201 là thành công
        return status >= 200 && status < 300;
      }
    });
    
    return {
      success: response.status >= 200 && response.status < 300,
      data: response.data?.data || null,
      message: response.data?.message || 'Product updated successfully'
    };
  } catch (error: any) {
    console.error('Lỗi khi cập nhật sản phẩm:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Failed to update product'
    };
  }
};

/**
* Thay đổi trạng thái sản phẩm
* @param {number} productId - ID của sản phẩm cần thay đổi trạng thái
* @param {string} status - Trạng thái mới ('draft', 'active', 'deleted', etc.)
* @returns {Promise<Object>} - Promise trả về kết quả thay đổi trạng thái sản phẩm
*/
export const changeProductStatus = async (productId: number, status: string) => {
 try {
   const response = await axioss.put(`${API_BASE_URL}/api/product/change-status`, 
     { 
       id: productId,
       status: status 
     },
     {
       headers: {
         'Content-Type': 'application/json',
       },
       validateStatus: function (status) {
         return status >= 200 && status < 300;
       }
     }
   );
   
   return {
     success: response.status >= 200 && response.status < 300,
     data: response.data?.data || null,
     message: response.data?.message || `Product status changed to ${status} successfully`
   };
 } catch (error: any) {
   console.error(`Lỗi khi thay đổi trạng thái sản phẩm:`, error);
   return {
     success: false,
     data: null,
     message: error.message || 'Failed to change product status'
   };
 }
};

/**
 * Xóa sản phẩm theo ID
 * @param {number} productId - ID của sản phẩm cần xóa
 * @returns {Promise<Object>} - Promise trả về kết quả xóa sản phẩm
 */
export const deleteProduct = async (productId: number) => {
  try {
    const response = await axioss.put(`${API_BASE_URL}/api/product/delete`, { id: productId }, {
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: function (status) {
        return status >= 200 && status < 300;
      }
    });
    
    return {
      success: response.status >= 200 && response.status < 300,
      data: response.data?.data || null,
      message: response.data?.message || 'Product deleted successfully'
    };
  } catch (error: any) {
    console.error('Lỗi khi xóa sản phẩm:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Failed to delete product'
    };
  }
};


export const createProductCategory = async (productCategoryData: ProductCategory) => {
  try {
    const response = await axioss.post(`${API_BASE_URL}/api/product-category/create-category`,productCategoryData , {
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: function (status) {
        // Chấp nhận mã trạng thái 200 và 201 là thành công
        return status >= 200 && status < 300;
      }

    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tạo sản phẩm:', error);
    throw error;
  }
};

/**
 * Cập nhật thông tin sản phẩm
 * @param {ProductAttributes} productData - Dữ liệu sản phẩm cần cập nhật
 * @returns {Promise<Object>} - Promise trả về kết quả cập nhật sản phẩm
 */
export const updateProductCategory = async (productCategoryData: ProductCategory) => {
  try {
    // Sử dụng URL tương đối thay vì URL tuyệt đối
    const response = await axioss.put('/api/product-category/update-category', productCategoryData, {
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: function (status) {
        // Chấp nhận mã trạng thái 200 và 201 là thành công
        return status >= 200 && status < 300;
      }

    });
    
    return response.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật sản phẩm:', error);
    throw error;
  }
};

/**
 * Xóa sản phẩm theo ID
 * @param {number} productId - ID của sản phẩm cần xóa
 * @returns {Promise<Object>} - Promise trả về kết quả xóa sản phẩm
 */
export const deleteProductCategory = async (productCategoryId: number) => {
  try {
    const response = await axioss.delete(`/api/product/delete/${productCategoryId}`);
    return response.data;
  } catch (error: any) {
    console.error('Lỗi khi xóa sản phẩm:', error);
    throw error;
  }
};

/**
 * Xóa sản phẩm vĩnh viễn theo ID
 * @param {number} productId - ID của sản phẩm cần xóa vĩnh viễn
 * @returns {Promise<Object>} - Promise trả về kết quả xóa sản phẩm
 */
export const permanentlyDeleteProduct = async (productId: number) => {
  try {
    const response = await axioss.delete(`${API_BASE_URL}/api/product/permanently-delete?id=${productId}`, {
      validateStatus: function (status) {
        return status >= 200 && status < 300;
      }
    });
    
    return {
      success: response.status >= 200 && response.status < 300,
      data: response.data?.data || null,
      message: response.data?.message || 'Product permanently deleted successfully'
    };
  } catch (error: any) {
    console.error('Lỗi khi xóa vĩnh viễn sản phẩm:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Failed to permanently delete product'
    };
  }
};

/**
 * Kích hoạt sản phẩm (thay đổi trạng thái từ draft sang active)
 * @param {number} productId - ID của sản phẩm cần kích hoạt
 * @returns {Promise<Object>} - Promise trả về kết quả kích hoạt sản phẩm
 */
export const activateProduct = async (productId: number) => {
  try {
    const response = await axioss.put(`${API_BASE_URL}/api/product/activate`, 
      { id: productId },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        }
      }
    );
    
    return {
      success: response.status >= 200 && response.status < 300,
      data: response.data?.data || null,
      message: response.data?.message || 'Product activated successfully'
    };
  } catch (error: any) {
    console.error('Lỗi khi kích hoạt sản phẩm:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Failed to activate product'
    };
  }
};

/**
 * Khôi phục sản phẩm (thay đổi trạng thái từ deleted sang active)
 * @param {number} productId - ID của sản phẩm cần khôi phục
 * @returns {Promise<Object>} - Promise trả về kết quả khôi phục sản phẩm
 */
export const restoreProduct = async (productId: number) => {
  try {
    const response = await axioss.put(`${API_BASE_URL}/api/product/restore`, 
      { id: productId },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        }
      }
    );
    
    return {
      success: response.status >= 200 && response.status < 300,
      data: response.data?.data || null,
      message: response.data?.message || 'Product restored successfully'
    };
  } catch (error: any) {
    console.error('Lỗi khi khôi phục sản phẩm:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Failed to restore product'
    };
  }
};