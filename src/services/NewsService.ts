import instance from '../../axiosConfig';
import { News, NewsSummary, NewsFormData } from '../data/News';

const API_URL = '/api/news';

interface ApiResponse {
  data: NewsSummary[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface SingleApiResponse {
  status: string;
  message: string;
  data: News;
}

class NewsServiceClass {
  async getAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    keyword?: string;
    status?: 'active' | 'inactive';
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  } = {}): Promise<ApiResponse> {
    try {
      const response = await instance.get(API_URL, { params });
      // Backend returns { status, message, data: { data, total, page, limit, totalPages } }
      // Backend response structure: { status, message, data: { data, total, page, limit, totalPages } }
      const responseData = response.data.data;
      return {
        data: responseData.data,
        pagination: {
          total: responseData.total,
          page: responseData.page,
          limit: responseData.limit,
          totalPages: responseData.totalPages,
        },
      };
    } catch (error) {
      console.error('Error fetching all news:', error);
      throw error;
    }
  }

  async getBySlug(slug: string): Promise<News> {
    try {
      const response = await instance.get(`${API_URL}/${slug}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching news with slug ${slug}:`, error);
      throw error;
    }
  }

  async create(newsData: NewsFormData): Promise<News> {
    try {
      const response = await instance.post(`${API_URL}/create`, newsData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating news:', error);
      throw error;
    }
  }

  async update(slug: string, newsData: Partial<NewsFormData>): Promise<News> {
    try {
      const response = await instance.put(`${API_URL}/update/${slug}`, newsData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating news with slug ${slug}:`, error);
      throw error;
    }
  }

  async changeStatus(id: number, status: 'active' | 'inactive'): Promise<News> {
    try {
      const response = await instance.patch(`${API_URL}/by-id/${id}/status`, { status });
      return response.data.data;
    } catch (error) {
      console.error(`Error changing status for news with id ${id}:`, error);
      throw error;
    }
  }

  async delete(ids: number[]): Promise<void> {
    try {
      await instance.delete(`${API_URL}/delete`, {
        data: { ids },
      });
    } catch (error) {
      console.error('Error deleting news:', error);
      throw error;
    }
  }

  async permanentlyDelete(ids: number[]): Promise<void> {
    try {
      await instance.delete(`${API_URL}/delete/permanent`, {
        data: { ids },
      });
    } catch (error) {
      console.error('Error permanently deleting news:', error);
      throw error;
    }
  }

  async restore(ids: number[]): Promise<void> {
    try {
      await instance.put(`${API_URL}/restore`, { ids });
    } catch (error) {
      console.error('Error restoring news:', error);
      throw error;
    }
  }
}

const NewsService = new NewsServiceClass();
export default NewsService;

