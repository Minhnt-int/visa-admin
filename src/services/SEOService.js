import axioss from '../../axiosConfig'; // Import axios từ thư viện axios
import { MetaSEOAttributes } from '@/data/metaData';
import { MetaJsonData } from '@/data/metaJsonData';
/**
 * Dịch vụ xử lý các chức năng liên quan đến SEO
 */

/**
 * Lấy metadata từ API cho một pageKey cụ thể
 * @param {string} pageKey - Khóa định danh duy nhất cho trang
 * @returns {Promise<object|null>} Đối tượng metadata hoặc null nếu không tìm thấy
 */
export async function getMetaData(pageKey) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/meta?pageKey=${pageKey}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Lỗi khi lấy metadata:', error);
    return null;
  }
}

export async function getAllMetaData() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/meta`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Lỗi khi lấy metadata:', error);
    return null;
  }
}

export const createMetaData = async (metaData) => {
  try {
    const response = await axioss.post(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/meta`,metaData , {
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
 * Cập nhật thông tin metaData
 * @returns {Promise<Object>} - Promise trả về kết quả cập nhật metaData
 */
export const updateMetaData = async (metaData) => {
  try {
    // Sử dụng URL tương đối thay vì URL tuyệt đối
    const response = await axioss.put('/api/meta', metaData, {
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
 * Xóa metaData theo pageKey
 * @param {string} pageKey - pageKey của metaData cần xóa
 * @returns {Promise<Object>} - Promise trả về kết quả xóa metaData
 */
export const deleteMetaData = async (pageKey) => {
  try {
    const response = await axioss.delete(`/api/meta`, {
      params: { pageKey },
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
 * Lấy metadata dạng JSON từ API cho một pageKey cụ thể
 * @param {string} pageKey - Khóa định danh duy nhất cho trang
 * @returns {Promise<MetaJsonData|null>} Đối tượng metadata JSON hoặc null nếu không tìm thấy
 */
export async function getMetaJsonData(pageKey) {
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/meta-json?pageKey=${pageKey}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Lỗi khi lấy metadata JSON:', error);
    return null;
  }
}
/**
 * Lấy metadata dạng JSON từ API cho một pageKey cụ thể
 * @returns {Promise<MetaJsonData[]>} Đối tượng metadata JSON hoặc null nếu không tìm thấy
 */
export async function getAllMetaJsonData() {
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/meta-json`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Lỗi khi lấy metadata JSON:', error);
    return null;
  }
}
/**
 * Tạo metadata JSON mới
 * @returns {Promise<ApiResponse<MetaJsonData>>} Kết quả từ API
 */
export const createMetaJsonData = async (metaJsonData) => {
  try {
    const response = await axioss.post(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/meta-json`,metaJsonData , {
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
 * Cập nhật metadata JSON
 * @returns {Promise<ApiResponse<MetaJsonData>>} Kết quả từ API
 */
export const updateMetaJsonData = async (metaJsonData) => {
  try {
    // Sử dụng URL tương đối thay vì URL tuyệt đối
    const response = await axioss.put('/api/meta-json', metaJsonData, {
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
 * Xóa metaData theo pageKey
 * @param {string} pageKey - pageKey của metaData cần xóa
 * @returns {Promise<Object>} - Promise trả về kết quả xóa metaData
 */
export const deleteMetaJsonData = async (pageKey) => {
  try {
    const response = await axioss.delete(`/api/meta-json`, {
      params: { pageKey },
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
 * Lấy tất cả dữ liệu meta (cả standard và JSON) cho một page key
 * @param {string} pageKey - Khóa định danh duy nhất cho trang
 * @returns {Promise<{meta: object|null, metaJson: object|null}>} Đối tượng chứa cả hai loại metadata
 */
export async function getAllMeta(pageKey) {
  const [meta, metaJson] = await Promise.all([
    getMetaData(pageKey),
    getMetaJsonData(pageKey)
  ]);
  
  return { meta, metaJson };
}

/**
 * Tạo cấu hình metadata Next.js từ dữ liệu API
 * @param {object} metaData - Đối tượng metadata từ API
 * @param {object} metaJsonData - Đối tượng metadata JSON từ API
 * @param {object} fallback - Giá trị dự phòng nếu không lấy được dữ liệu từ API
 * @returns {object} Đối tượng cấu hình metadata cho Next.js
 */
export function generateMetadataFromAPI(metaData, fallback = {}, metaJsonData = null) {
  if (!metaData && !metaJsonData) {
    return fallback;
  }

  // Tạo metadata từ các trường cơ bản
  const basicMeta = metaData ? {
    title: metaData.title,
    description: metaData.description,
    keywords: metaData.keywords,
    openGraph: metaData.ogTitle ? {
      title: metaData.ogTitle,
      description: metaData.ogDescription,
      images: metaData.ogImage ? [metaData.ogImage] : [],
    } : undefined,
    ...(metaData.customHead ? { custom: metaData.customHead } : {})
  } : {};

  // Nếu có dữ liệu meta JSON, kết hợp với dữ liệu cơ bản
  if (metaJsonData && metaJsonData.metaData) {
    return {
      ...basicMeta,
      ...metaJsonData.metaData
    };
  }
  
  // Nếu không có dữ liệu JSON, sử dụng dữ liệu cơ bản hoặc fallback
  return Object.keys(basicMeta).length > 0 ? basicMeta : fallback;
}

/**
 * Hàm tiện ích để tạo cấu hình metadata từ tất cả nguồn dữ liệu
 * @param {string} pageKey - Khóa định danh duy nhất cho trang
 * @param {object} fallback - Giá trị dự phòng nếu không lấy được dữ liệu từ API
 * @returns {Promise<object>} Đối tượng cấu hình metadata cho Next.js
 */
export async function generateCompleteMeta(pageKey, fallback = {}) {
  const { meta, metaJson } = await getAllMeta(pageKey);
  return generateMetadataFromAPI(meta, fallback, metaJson);
}
