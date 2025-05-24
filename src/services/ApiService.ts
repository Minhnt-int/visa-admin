import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Tạo instance của axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 giây
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor cho request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor cho response
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xử lý khi token hết hạn
      localStorage.removeItem("token");
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const ApiService = {
  setHeader() {
    const token = localStorage.getItem("token");
    if (token) {
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  },

  removeHeader() {
    axiosInstance.defaults.headers.common = {};
  },

  get(resource: string, params?: any) {
    return axiosInstance.get(resource, { params });
  },

  post(resource: string, data: any) {
    return axiosInstance.post(resource, data);
  },

  put(resource: string, data: any) {
    return axiosInstance.put(resource, data);
  },

  delete(resource: string) {
    return axiosInstance.delete(resource);
  },

  /**
   * Xử lý phản hồi API
   */
  handleResponse<T>(response: any): { data: T, success: boolean, message: string } {
    if (response && response.data) {
      return {
        data: response.data.data || [],
        success: response.status >= 200 && response.status < 300 || false,
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
      // Lỗi response từ server - kiểm tra nhiều cấu trúc lỗi phổ biến
      if (error.response.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else {
        errorMessage = `Lỗi từ server: ${error.response.status}`;
      }
    } else if (error.request) {
      // Không nhận được response
      errorMessage = 'Không thể kết nối đến server';
    } else {
      // Lỗi trong quá trình thiết lập request
      errorMessage = error.message || errorMessage;
    }
    
    console.error('API Error:', errorMessage, error);
    
    return {
      data: [],
      success: false,
      message: errorMessage,
    };
  }
};

export default ApiService;