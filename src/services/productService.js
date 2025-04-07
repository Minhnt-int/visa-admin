/**
 * Service cho các cuộc gọi API liên quan đến sản phẩm
 */

import axioss from '../../axiosConfig'; // Import axios từ thư viện axios
// Thêm kiểm tra và fallback cho API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Lấy danh sách sản phẩm dựa trên các tham số được cung cấp
 * @param {Object} params - Các tham số truy vấn cho API
 * @param {string} params.categoryId - Lọc theo ID danh mục
 * @param {string} params.search - Từ khóa tìm kiếm
 * @param {string} params.sortBy - Trường để sắp xếp theo
 * @param {string} params.sortOrder - Hướng sắp xếp (asc/desc)
 * @param {number} params.page - Số trang
 * @param {number} params.limit - Số mục mỗi trang
 * @returns {Promise<Object>} - Promise trả về dữ liệu sản phẩm
 */
export const fetchProductList = async ({
  categoryId = '',
  search = '',
  sortBy = '',
  sortOrder = '',
  page = 1,
  limit = 12
} = {}) => {
  try {
    const params = {
      categoryId,
      search,
      sortBy,
      sortOrder,
      page,
      limit
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
    
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm:", error);
    throw error;
  }
};

/**
 * Lấy thông tin chi tiết sản phẩm theo slug
 * @param {string} slug - Slug của sản phẩm
 * @returns {Promise<Object>} - Promise trả về dữ liệu sản phẩm
 */
export const fetchProductBySlug = async (slug) => {
  try {
    const response = await axioss.get(`${API_BASE_URL}/api/product/get-product-by-slug`, {
      params: { slug },
      validateStatus: function (status) {
        // Chấp nhận mã trạng thái 200-299 là thành công
        return status >= 200 && status < 300;
      }
    });
    
    return response; // Trả về toàn bộ response để có thể truy cập response.data
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin sản phẩm với slug ${slug}:`, error);
    throw error;
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

export const createProduct = async (productData) => {
  try {
    const response = await axioss.post(`${API_BASE_URL}/api/product/create`,productData , {
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
export const updateProduct = async (productData) => {
  try {
    // Sử dụng URL tương đối thay vì URL tuyệt đối
    const response = await axioss.put('/api/product/update', productData, {
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
export const deleteProduct = async (productId) => {
  try {
    const response = await axioss.delete(`/api/product/delete/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm:', error);
    throw error;
  }
};


export const createProductCategory = async (productCategoryData) => {
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
export const updateProductCategory = async (productCategoryData) => {
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
export const deleteProductCategory = async (productCategoryId) => {
  try {
    const response = await axioss.delete(`/api/product/delete/${productCategoryId}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm:', error);
    throw error;
  }
};