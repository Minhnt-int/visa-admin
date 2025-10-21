import instance from '../../axiosConfig';
import { Tour, TourSummary, TourFormData, TourCategory } from '../data/Tour';

const API_URL = '/api/tours';
const CATEGORY_API_URL = '/tour-categories';

interface ApiResponse {
  data: TourSummary[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface CategoryApiResponse {
  data: TourCategory[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class TourServiceClass {
  async getAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string;
    categorySlug?: string;
    country?: string;
    isHot?: boolean;
    minPrice?: number;
    maxPrice?: number;
    status?: 'active' | 'inactive';
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  } = {}): Promise<ApiResponse> {
    try {
      const response = await instance.get(API_URL, { params });
      // Backend response structure: { data: [...], pagination: { total, page, limit, totalPages } }
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error('Error fetching all tours:', error);
      throw error;
    }
  }

  async getBySlug(slug: string): Promise<Tour> {
    try {
      const response = await instance.get(`${API_URL}/${slug}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching tour with slug ${slug}:`, error);
      throw error;
    }
  }

  async create(tourData: TourFormData): Promise<Tour> {
    try {
      const response = await instance.post(API_URL, tourData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating tour:', error);
      throw error;
    }
  }

  async update(slug: string, tourData: Partial<TourFormData>): Promise<Tour> {
    try {
      const response = await instance.put(`${API_URL}/${slug}`, tourData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating tour with slug ${slug}:`, error);
      throw error;
    }
  }

  async changeStatus(id: number, status: 'active' | 'inactive'): Promise<Tour> {
    try {
      const response = await instance.patch(`${API_URL}/by-id/${id}/status`, { status });
      return response.data.data;
    } catch (error) {
      console.error(`Error changing status for tour with id ${id}:`, error);
      throw error;
    }
  }

  async softDelete(ids: number[]): Promise<void> {
    try {
      await instance.put(API_URL, { ids });
    } catch (error) {
      console.error('Error soft deleting tours:', error);
      throw error;
    }
  }

  async permanentlyDelete(ids: number[]): Promise<void> {
    try {
      await instance.delete(API_URL, {
        params: { ids: ids.join(',') },
      });
    } catch (error) {
      console.error('Error permanently deleting tours:', error);
      throw error;
    }
  }

  async restore(ids: number[]): Promise<void> {
    try {
      await instance.put(`${API_URL}/restore`, { ids });
    } catch (error) {
      console.error('Error restoring tours:', error);
      throw error;
    }
  }

  // Tour Categories
  async getAllCategories(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive';
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  } = {}): Promise<CategoryApiResponse> {
    try {
      const response = await instance.get(CATEGORY_API_URL, { params });
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error('Error fetching tour categories:', error);
      throw error;
    }
  }

  async getCategoryBySlug(slug: string): Promise<TourCategory> {
    try {
      const response = await instance.get(`${CATEGORY_API_URL}/${slug}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching tour category with slug ${slug}:`, error);
      throw error;
    }
  }

  async createCategory(categoryData: Partial<TourCategory>): Promise<TourCategory> {
    try {
      const response = await instance.post(CATEGORY_API_URL, categoryData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating tour category:', error);
      throw error;
    }
  }

  async updateCategory(slug: string, categoryData: Partial<TourCategory>): Promise<TourCategory> {
    try {
      const response = await instance.put(`${CATEGORY_API_URL}/${slug}`, categoryData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating tour category with slug ${slug}:`, error);
      throw error;
    }
  }

  async deleteCategory(ids: number[]): Promise<void> {
    try {
      await instance.delete(CATEGORY_API_URL, {
        params: { ids: ids.join(',') },
      });
    } catch (error) {
      console.error('Error deleting tour categories:', error);
      throw error;
    }
  }
}

const TourService = new TourServiceClass();
export default TourService;

