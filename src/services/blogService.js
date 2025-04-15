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
export const fetchBlogList = async ({
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
    
    const response = await axioss.get(`${API_BASE_URL}/api/blog/get-list`, {
      params: filteredParams,
      validateStatus: function (status) {
        // Chấp nhận mã trạng thái 200-299 là thành công
        return status >= 200 && status < 300;
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách blog:", error);
    throw error;
  }
};

export const fetchBlogCategories = async (
  page = 1,
  limit = 12,
  name = '',
  sortBy = '',
  sortOrder = '') => {
  try {
    const params = {
      name,
      sortBy,
      sortOrder,
      page,
      limit
    };
    
    // Filter out empty parameters
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => 
        value !== undefined && value !== null && value !== ''
      )
    );
    const response = await axioss.get(`${API_BASE_URL}/api/blog-categories`, {
      params: filteredParams,
      validateStatus: function (status) {
        // Accept 200-299 status codes as successful
        return status >= 200 && status < 300;
      }
    });

    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy danh sách blog categories:`, error);
    throw error;
  }
};

export const updateBlogCategory = async (blogCategoryData) => {
  try {
    // Sử dụng URL tương đối thay vì URL tuyệt đối
    const response = await axioss.put('/api/blog-categories', blogCategoryData, {
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
 * Lấy thông tin chi tiết bài viết blog theo slug
 * @param {string} slug - Slug của bài viết
 * @returns {Promise<Object>} - Promise trả về dữ liệu bài viết
 */
export const fetchBlogBySlug = async (slug) => {
  try {
    const response = await axioss.get(`${API_BASE_URL}/api/blog/${slug}`, {
      validateStatus: function (status) {
        // Chấp nhận mã trạng thái 200-299 là thành công
        return status >= 200 && status < 300;
      }
    });
    
    return response.data; // Trả về toàn bộ response để có thể truy cập response.data
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin bài viết với slug ${slug}:`, error);
    throw error;
  }
};

/**
 * Lấy danh sách sản phẩm phổ biến
  * @returns {Promise<Array>} - Promise trả về danh sách sản phẩm phổ biến
 */
export const fetchPopularBlogs = async (

) => {
  // Trả về mảng rỗng để vô hiệu hóa tạm thời
  return [];
};


export const createBlog = async (blogData) => {
  try {
    const response = await axioss.post(`${API_BASE_URL}/api/blog/create-blog`,blogData , {
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
 * Cập nhật thông tin bài viết blog
 * @param {Object} blogData - Dữ liệu bài viết cần cập nhật
 * @returns {Promise<Object>} - Promise trả về kết quả cập nhật bài viết
 */
export const updateBlog = async (blogData) => {
  try {
    console.log('Updating blog with data:', blogData); // Debug log
    
    const response = await axioss.put(`${API_BASE_URL}/api/blog/update-blog`, blogData, {
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: function (status) {
        // Chấp nhận mã trạng thái 200 và 201 là thành công
        return status >= 200 && status < 300;
      }
    });
    
    console.log('Update response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật bài viết:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
};

/**
 * Xóa sản phẩm theo ID
 * @param {number} blogId - ID của sản phẩm cần xóa
 * @returns {Promise<Object>} - Promise trả về kết quả xóa sản phẩm
 */
export const deleteBlog = async (blogId) => {
  try {
    const response = await axioss.delete(`/api/blog/delete/${blogId}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm:', error);
    throw error;
  }
};

/**
 * Xóa sản phẩm theo ID
 * @param {number} blogCategoryId - ID của sản phẩm cần xóa
 * @returns {Promise<Object>} - Promise trả về kết quả xóa danh mục sản phẩm
 */
export const deleteCategoryBlog = async (blogCategoryId) => {
  try {
    const response = await axioss.delete(`/api/blog/delete/${blogCategoryId}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm:', error);
    throw error;
  }
};