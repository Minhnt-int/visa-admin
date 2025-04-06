/**
 * Service cho các cuộc gọi API liên quan đến sản phẩm
 */

import axioss from '../../axiosConfig'; // Import axios từ thư viện axios

/**
 * Lấy danh sách đơn hàng từ API
 * @param {Object} options - Các tùy chọn tìm kiếm và phân trang
 * @returns {Promise<Object>} - Kết quả từ API
 */
export const fetchOrderList = async ({
  startDate = null,
  endDate = null,
  userId = null,
  status = null,
  search = '',
  sortBy = '',
  sortOrder = '',
  page = 1,
  limit = 10
} = {}) => {
  try {
    const params = {
      startDate,
      endDate,
      userId,
      status,
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
    
    const response = await axioss.get(`/api/order/list`, {
      params: filteredParams
    });
    
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    throw error;
  }
};

/**
 * Lấy thông tin chi tiết của một đơn hàng
 * @param {number} id - ID của đơn hàng
 * @returns {Promise<Object>} - Thông tin đơn hàng
 */
export const fetchOrderById = async (id) => {
  try {
    const response = await axioss.get(`/api/order/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy đơn hàng #${id}:`, error);
    throw error;
  }
};

/**
 * Tạo đơn hàng mới
 * @param {Object} orderData - Dữ liệu đơn hàng
 * @returns {Promise<Object>} - Kết quả từ API
 */
export const createOrder = async (orderData) => {
  try {
    const response = await axioss.post(`/api/order/create`, orderData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    throw error;
  }
};

/**
 * Cập nhật đơn hàng
 * @param {Object} orderData - Dữ liệu đơn hàng cần cập nhật
 * @returns {Promise<Object>} - Kết quả từ API
 */
export const updateOrder = async (orderData) => {
  try {
    const response = await axioss.put(`/api/order/update/${orderData.id}`, orderData);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật đơn hàng #${orderData.id}:`, error);
    throw error;
  }
};

/**
 * Xóa đơn hàng
 * @param {number} id - ID của đơn hàng cần xóa
 * @returns {Promise<Object>} - Kết quả từ API
 */
export const deleteOrder = async (id) => {
  try {
    const response = await axioss.delete(`/api/order/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa đơn hàng #${id}:`, error);
    throw error;
  }
};