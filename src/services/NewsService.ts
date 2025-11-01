import instance from '../../axiosConfig';
import { NewsAttributes } from '../data/News';

export interface NewsListResponse {
  status: 'success' | 'fail' | 'error';
  message: string;
  data: {
    data: NewsAttributes[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface NewsResponse {
  status: 'success' | 'fail' | 'error';
  message: string;
  data: NewsAttributes;
}

class NewsService {
  /**
   * Lấy danh sách tin tức với phân trang và tìm kiếm
   */
  async getList(params?: {
    page?: number;
    limit?: number;
    search?: string;
    keyword?: string;
    status?: 'active' | 'inactive';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<NewsListResponse> {
    try {
      const response = await instance.get('/api/news', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Không thể lấy danh sách tin tức');
    }
  }

  /**
   * Lấy tin tức theo slug
   */
  async getBySlug(slug: string): Promise<NewsAttributes> {
    try {
      const response = await instance.get(`/api/news/${slug}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Không thể lấy tin tức');
    }
  }

  /**
   * Lấy tin tức theo ID
   */
  async getById(id: number): Promise<NewsAttributes> {
    try {
      const response = await instance.get(`/api/news/by-id/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Không thể lấy tin tức');
    }
  }

  /**
   * Tạo tin tức mới
   */
  async create(data: NewsAttributes): Promise<NewsResponse> {
    try {
      const response = await instance.post('/api/news/create', {
        title: data.title,
        content: data.content,
        slug: data.slug,
        image_url: data.imageUrl,
        excerpt: data.excerpt,
        meta_keywords: data.metaKeywords,
        author: data.author,
        published_at: data.publishedAt,
        read_time: data.readTime,
        status: data.status || 'published'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Không thể tạo tin tức');
    }
  }

  /**
   * Cập nhật tin tức
   */
  async update(data: NewsAttributes): Promise<NewsResponse> {
    try {
      const response = await instance.put('/api/news/update', {
        id: data.id, // Sử dụng ID thay vì slug để identify record
        slug: data.slug,
        title: data.title,
        content: data.content,
        image_url: data.imageUrl,
        excerpt: data.excerpt,
        meta_keywords: data.metaKeywords
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Không thể cập nhật tin tức');
    }
  }

  /**
   * Soft delete tin tức (chuyển sang inactive)
   */
  async softDelete(ids: number[]): Promise<{ status: 'success' | 'fail'; message: string }> {
    try {
      const promises = ids.map(id => 
        instance.patch(`/api/news/by-id/${id}/status`, { status: 'inactive' })
      );
      const responses = await Promise.all(promises);
      return { status: 'success', message: `Đã chuyển ${ids.length} bài viết thành inactive` };
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Không thể chuyển trạng thái tin tức');
    }
  }

  /**
   * Hard delete tin tức (xóa vĩnh viễn)
   */
  async delete(ids: number[]): Promise<{ status: 'success' | 'fail'; message: string }> {
    try {
      const response = await instance.delete('/api/news/delete', {
        data: { ids }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Không thể xóa tin tức');
    }
  }

  /**
   * Lấy tất cả tin tức (không phân trang)
   */
  async getAll(params?: {
    search?: string;
    keyword?: string;
    status?: 'active' | 'inactive';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<NewsListResponse> {
    try {
      const response = await instance.get('/api/news', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Không thể lấy danh sách tin tức');
    }
  }

  /**
   * Thay đổi trạng thái tin tức
   */
  async changeStatus(id: number, status: 'active' | 'inactive'): Promise<{ status: 'success' | 'fail'; message: string }> {
    try {
      const response = await instance.patch(`/api/news/by-id/${id}/status`, {
        status
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Không thể thay đổi trạng thái tin tức');
    }
  }
}

export default new NewsService();