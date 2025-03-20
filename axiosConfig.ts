import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3002', // Đặt URL cơ sở tại đây
});

export default instance;