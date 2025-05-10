/**
 * Service cho các cuộc gọi API liên quan đến sản phẩm
 */

import axioss from '../../axiosConfig'; // Import axios từ thư viện axios
// Thêm kiểm tra và fallback cho API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * @typedef {Object} FetchBlogListParams
 * @property {string} [categoryId] - Lọc theo ID danh mục
 * @property {string} [search] - Từ khóa tìm kiếm
 * @property {string} [sortBy] - Trường để sắp xếp theo
 * @property {string} [sortOrder] - Hướng sắp xếp (asc/desc)
 * @property {number} [page] - Số trang
 * @property {number} [limit] - Số mục mỗi trang
 * @property {string} [status] - Trạng thái bài viết
 */

/**
 * Lấy danh sách sản phẩm dựa trên các tham số được cung cấp
 * @param {FetchBlogListParams} params - Các tham số truy vấn cho API
 * @returns {Promise<Object>} - Promise trả về dữ liệu sản phẩm
 */
export const fetchBlogList = async ({
  categoryId = '',
  search = '',
  sortBy = '',
  sortOrder = '',
  page = 1,
  limit = 12,
  status = ''
} = {}) => {
  try {
    const params = {
      categoryId,
      search,
      sortBy,
      sortOrder,
      page,
      limit,
      status
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
 * @param {number} id - ID của sản phẩm cần xóa
 * @returns {Promise<Object>} - Promise trả về kết quả xóa sản phẩm
 */
export const deleteBlog = async (id) => {
  try {
    const response = await axioss.delete(`/api/blog`, {
      params: { id },
      headers: {
        'Content-Type': 'application/json'
      },
      validateStatus: function (status) {
        return status >= 200 && status < 300;
      }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa bài viết:', error);
    throw error;
  }
};


/**
 * Thay đổi trạng thái bài viết blog
 * @param {number} blogId - ID của bài viết
 * @param {string} status - Trạng thái mới (active, draft, deleted)
 * @returns {Promise<Object>} - Promise trả về kết quả thay đổi trạng thái
 */
export const changeBlogStatus = async (blogId, status) => {
  try {
    const response = await axioss.put(`/api/blog-post/change-status`, {
      id: blogId,
      status
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: function (status) {
        // Chấp nhận mã trạng thái 200-299 là thành công
        return status >= 200 && status < 300;
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Lỗi khi thay đổi trạng thái bài viết:', error);
    throw error;
  }
};

/**
 * Thay đổi trạng thái danh mục blog
 * @param {number} categoryId - ID của danh mục
 * @param {string} status - Trạng thái mới (active, draft, deleted)
 * @returns {Promise<Object>} - Promise trả về kết quả thay đổi trạng thái
 */
export const changeBlogCategoryStatus = async (categoryId, status) => {
  try {
    const response = await axioss.put(`/api/blog-categories/change-status`, {
      id: categoryId,
      status
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: function (status) {
        // Chấp nhận mã trạng thái 200-299 là thành công
        return status >= 200 && status < 300;
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Lỗi khi thay đổi trạng thái danh mục blog:', error);
    throw error;
  }
};

/**
 * Generate AI content for blog post
 * @param {string} title - Title of the blog post
 * @param {string} mode - Mode of AI content generation (write or evaluate)
 * @returns {Promise<Object>} - Promise returns AI generated content
 */
export const generateAIContent = async (title, mode = 'write') => {
  try {
    const prompt = mode === 'write' 
      ? "Hãy viết một bài tin tức chuẩn SEO theo tiêu chí Google về: " + title
      : "Hãy giúp tôi đánh giá SEO của bài viết này với các tiêu chí của Google theo thang điểm 100, gợi ý và gửi lại một bản hoàn thiện để tăng điểm SEO.\n" + title;

    const response = await axioss.post(`${API_BASE_URL}/api/ai`, {
      content: prompt
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: function (status) {
        return status >= 200 && status < 300;
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error generating AI content:', error);
    throw error;
  }
};

/**
 * Get AI suggestions for blog post
 * @param {string} content - Content of the blog post
 * @returns {Promise<Object>} - Promise returns AI suggestions
 */
export const getAISuggestions = async (content) => {
  try {
    const response = await axioss.post(`${API_BASE_URL}/api/ai/suggestions`, {
      content
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: function (status) {
        return status >= 200 && status < 300;
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    throw error;
  }
};