import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { refreshAccessToken } from './src/utils/tokenRefresh';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag để tránh infinite loop khi refresh token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Add request interceptor để tự động thêm Authorization header
instance.interceptors.request.use(
  (config) => {
    // Sử dụng accessToken từ localStorage (phù hợp với auth system mới)
    // Chỉ thêm token nếu có, không bắt buộc cho các API public
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling và auto refresh token
instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.code === 'ECONNREFUSED') {
      console.error('Backend server is not running at', instance.defaults.baseURL);
    }
    
    // Xử lý khi token hết hạn (401)
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const hadToken = originalRequest?.headers?.Authorization;
      
      // Chỉ thử refresh nếu có token trong request ban đầu
      if (hadToken && !originalRequest._retry) {
        // Nếu đang refresh, thêm request vào queue
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return instance(originalRequest);
          }).catch((err) => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await refreshAccessToken();
          
          if (newToken) {
            // Update token trong header
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            
            // Process queue với success
            processQueue(null, newToken);
            
            // Retry original request với token mới
            return instance(originalRequest);
          } else {
            // Refresh thất bại, process queue với error
            const refreshError = new Error('Failed to refresh token');
            processQueue(refreshError);
            return Promise.reject(refreshError);
          }
        } catch (refreshError) {
          // Refresh thất bại, process queue với error
          processQueue(refreshError as Error);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else if (!hadToken) {
        // Không có token và bị 401 - có thể là API public hoặc cần login
        // Không làm gì, để component xử lý
      } else {
        // Đã retry nhưng vẫn lỗi, có thể refresh token cũng hết hạn
        // Redirect về login
        if (!window.location.pathname.includes('/authentication/login')) {
          window.location.href = '/authentication/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default instance;