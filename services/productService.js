/**
 * Service cho các cuộc gọi API liên quan đến sản phẩm
 */

import { getRequest } from './apiClient';
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
export const fetchProductList = async ({
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
    
    return await getRequest('/api/product/list', params);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm:", error);
    throw error;
  }
};

/**
 * Lấy thông tin chi tiết sản phẩm theo slug
 * @param {string} slug - Slug của sản phẩm
 * @returns {Promise<Object>} - Promise trả về dữ liệu sản phẩm
 */
export const fetchProductBySlug = async (slug) => {
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/product/get-product-by-slug?slug=${slug}`, {
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) {
      throw new Error(`Lỗi API: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin sản phẩm với slug ${slug}:`, error);
    throw error;
  }
};

/**
 * Lấy danh sách sản phẩm phổ biến
  * @returns {Promise<Array>} - Promise trả về danh sách sản phẩm phổ biến
 */
export const fetchPopularProducts = async (

) => {
  // Trả về mảng rỗng để vô hiệu hóa tạm thời
  console.log("fetchPopularProducts đã bị vô hiệu hóa, trả về mảng rỗng");
  return [];
};


export const fetchProductCategories = async (  page = 1,
  limit = 10,) => {
 try {
   const response = await fetch(`${API_BASE_URL}/api/product-category/get-list?page=` + page + `&limit=` + limit, {
     next: { revalidate: 3600 }
   });
   
   if (!response.ok) {
     throw new Error(`Lỗi API: ${response.status}`);
   }
   
   return await response.json();
 } catch (error) {
   console.error(`Lỗi khi lấy thông tin loại sản phẩm:`, `${API_BASE_URL}/api/product-category/get-list?page=` + page + `&limit=` + limit , "\n Lỗi: " ,error);
   throw error;
 }
};

export const createProduct = async (productData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/product/create`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Lỗi API: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Lỗi khi tạo sản phẩm:', error);
    throw error;
  }
};

/**
 * Cập nhật thông tin sản phẩm
 * @param {ProductAttributes} productData - Dữ liệu sản phẩm cần cập nhật
 * @returns {Promise<Object>} - Promise trả về kết quả cập nhật sản phẩm
 */

export const updateProduct = async (productData) => {
  try {
    // Import axios nếu chưa có
    const axios = require('axios'); // Hoặc import axios from 'axios'; nếu bạn đang sử dụng ES modules
    
    // Sử dụng axios thay vì fetch
    const response = await axios.put(`${API_BASE_URL}/api/product/update`, productData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    // Axios tự động chuyển đổi response thành JSON và trả về trong response.data
    return response.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật sản phẩm:', error);
    throw error;
  }
};