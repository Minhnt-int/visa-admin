/**
 * Các hàm tiện ích để gọi API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Tạo URL đầy đủ cho các yêu cầu API
 * @param {string} endpoint - Đường dẫn API endpoint
 * @param {Object} [params={}] - Các tham số truy vấn
 * @returns {URL} - URL hoàn chỉnh với các tham số truy vấn
 */
export const createApiUrl = (endpoint, params = {}) => {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  
  // Thêm các tham số truy vấn có giá trị
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value);
    }
  });
  
  return url;
};

/**
 * Thực hiện GET request đến API
 * @param {string} endpoint - Đường dẫn API endpoint
 * @param {Object} [params={}] - Các tham số truy vấn
 * @param {Object} [options={}] - Các tùy chọn fetch bổ sung
 * @returns {Promise<any>} - Promise trả về dữ liệu phản hồi
 */
export const getRequest = async (endpoint, params = {}, options = {}) => {
  try {
    const url = createApiUrl(endpoint, params);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      ...options
    });
    
    if (!response.ok) {
      // Thêm xử lý để lấy thông tin lỗi chi tiết hơn
      try {
        const errorData = await response.json();
        console.error('Chi tiết lỗi từ server:', errorData);
        throw new Error(`Lỗi API: ${response.status} - ${errorData.message || JSON.stringify(errorData)}`);
      } catch (parseError) {
        throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
      }
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Lỗi trong GET request đến ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Thực hiện POST request đến API
 * @param {string} endpoint - Đường dẫn API endpoint
 * @param {Object} data - Dữ liệu body request
 * @param {Object} [options={}] - Các tùy chọn fetch bổ sung
 * @returns {Promise<any>} - Promise trả về dữ liệu phản hồi
 */
export const postRequest = async (endpoint, data, options = {}) => {
  try {
    const url = createApiUrl(endpoint);
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data),
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`Lỗi API: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Lỗi trong POST request đến ${endpoint}:`, error);
    throw error;
  }
};

// You can add other methods like PUT, DELETE, etc. as needed