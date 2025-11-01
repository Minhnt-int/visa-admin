import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3002', // Gọi trực tiếp backend port 3002
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED') {
      console.error('Backend server is not running at', instance.defaults.baseURL);
    }
    return Promise.reject(error);
  }
);

export default instance;