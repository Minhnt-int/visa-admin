import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002', // Đặt URL cơ sở tại đây
});

export default instance;