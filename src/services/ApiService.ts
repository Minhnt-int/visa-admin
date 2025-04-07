import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const ApiService = {
  setHeader() {
    axios.defaults.headers.common["Content-Type"] = "application/json";
    // Thêm authorization header nếu cần
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  },

  removeHeader() {
    axios.defaults.headers.common = {};
  },

  get(resource: string) {
    return axios.get(`${API_URL}${resource}`);
  },

  post(resource: string, data: any) {
    return axios.post(`${API_URL}${resource}`, data);
  },

  put(resource: string, data: any) {
    return axios.put(`${API_URL}${resource}`, data);
  },

  delete(resource: string) {
    return axios.delete(`${API_URL}${resource}`);
  },

  /**
   * Xử lý phản hồi API
   */
  handleResponse<T>(response: any): { data: T, success: boolean, message: string } {
    if (response && response.data) {
      return {
        data: response.data.data || [],
        success: response.data.success || false,
        message: response.data.message || '',
      };
    }
    
    return {
      data: [] as unknown as T,
      success: false,
      message: 'Không có dữ liệu',
    };
  },

  /**
   * Xử lý lỗi từ API
   */
  handleError(error: any): { data: any, success: boolean, message: string } {
    let errorMessage = 'Đã xảy ra lỗi không xác định';
    
    if (error.response) {
      // Lỗi response từ server
      errorMessage = error.response.data.message || 'Lỗi từ server';
    } else if (error.request) {
      // Không nhận được response
      errorMessage = 'Không thể kết nối đến server';
    } else {
      // Lỗi trong quá trình thiết lập request
      errorMessage = error.message;
    }
    
    return {
      data: [],
      success: false,
      message: errorMessage,
    };
  }
};

export default ApiService; 