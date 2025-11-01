import instance from '../../axiosConfig';
import { TourFormData, TourSummary } from '../data/Tour';

export interface Tour {
  id?: number;
  slug: string;
  name: string;
  categoryId: number;
  country: string;
  duration: string;
  price: number;
  originalPrice?: number;
  departure: string[];
  image: string;
  gallery: string[];
  rating: number;
  reviewCount: number;
  isHot: boolean;
  groupSize: {
    min: number;
    max: number;
  };
  highlights: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
  }>;
  itinerary: Array<{
    day: string;
    title: string;
    activities: Array<{
      activity: string;
    }>;
    description: string;
  }>;
  services: {
    included: Array<{
      id: string;
      name: string;
    }>;
    excluded: Array<{
      id: string;
      name: string;
    }>;
  };
  terms: {
    registration: string[];
    cancellation: string[];
    payment: string[];
  };
  whyChooseUs: Array<{
    id: string;
    icon: string;
    title: string;
    description: string;
  }>;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface TourListResponse {
  data: TourSummary[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TourResponse {
  message: string;
  data: Tour;
}

class TourService {
  /**
   * Lấy danh sách tours với phân trang và tìm kiếm
   */
  async getList(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categorySlug?: string;
    country?: string;
    isHot?: boolean;
    minPrice?: number;
    maxPrice?: number;
    status?: 'active' | 'inactive' | 'all';
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<TourListResponse> {
    try {
      const response = await instance.get('/api/tours', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Không thể lấy danh sách tours');
    }
  }

  /**
   * Lấy tất cả tours (alias cho getList)
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categorySlug?: string;
    country?: string;
    isHot?: boolean;
    minPrice?: number;
    maxPrice?: number;
    status?: 'active' | 'inactive' | 'all';
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<TourListResponse> {
    return this.getList(params);
  }

  /**
   * Lấy tour theo slug
   */
  async getBySlug(slug: string): Promise<Tour> {
    try {
      const response = await instance.get(`/api/tours/${slug}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Không thể lấy tour');
    }
  }

  /**
   * Tạo tour mới
   */
  async create(data: TourFormData): Promise<TourResponse> {
    try {
      const response = await instance.post('/api/tours', {
        slug: data.slug,
        name: data.name,
        categoryId: data.categoryId,
        country: data.country,
        duration: data.duration,
        price: data.price,
        originalPrice: data.originalPrice,
        departure: data.departure,
        image: data.image,
        gallery: data.gallery,
        rating: data.rating,
        reviewCount: data.reviewCount,
        isHot: data.isHot,
        groupSize: data.groupSize,
        highlights: data.highlights,
        itinerary: data.itinerary,
        services: data.services,
        terms: data.terms,
        whyChooseUs: data.whyChooseUs,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
        status: data.status || 'active'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Không thể tạo tour');
    }
  }

  /**
   * Cập nhật tour
   */
  async update(id: number, data: TourFormData): Promise<TourResponse> {
    try {
      const response = await instance.put('/api/tours', {
        id: id,
        name: data.name,
        categoryId: data.categoryId,
        country: data.country,
        duration: data.duration,
        price: data.price,
        originalPrice: data.originalPrice,
        departure: data.departure,
        image: data.image,
        gallery: data.gallery,
        rating: data.rating,
        reviewCount: data.reviewCount,
        isHot: data.isHot,
        groupSize: data.groupSize,
        highlights: data.highlights,
        itinerary: data.itinerary,
        services: data.services,
        terms: data.terms,
        whyChooseUs: data.whyChooseUs,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
        status: data.status
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Không thể cập nhật tour');
    }
  }

  /**
   * Xóa tour (soft delete - đánh dấu status = inactive)
   */
  async softDelete(id: number): Promise<{ message: string; data: { id: number; status: string } }> {
    try {
      const response = await instance.patch(`/api/tours/by-id/${id}/status`, {
        status: 'inactive'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Không thể xóa tour');
    }
  }

  /**
   * Xóa tour vĩnh viễn (hard delete)
   */
  async delete(id: number): Promise<{ message: string; data: { id: number } }> {
    try {
      const response = await instance.delete(`/api/tours?id=${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Không thể xóa tour vĩnh viễn');
    }
  }

  /**
   * Xóa tour vĩnh viễn (alias cho delete)
   */
  async permanentlyDelete(id: number): Promise<{ message: string; data: { id: number } }> {
    return this.delete(id);
  }

  /**
   * Khôi phục tour từ soft delete (đánh dấu status = active)
   */
  async restore(id: number): Promise<{ message: string; data: { id: number; status: string } }> {
    try {
      const response = await instance.patch(`/api/tours/by-id/${id}/status`, {
        status: 'active'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Không thể khôi phục tour');
    }
  }

  /**
   * Thay đổi trạng thái tour
   */
  async changeStatus(id: number, status: 'active' | 'inactive'): Promise<{ success: boolean; message: string }> {
    try {
      const response = await instance.patch(`/api/tours/by-id/${id}/status`, {
        status
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Không thể thay đổi trạng thái tour');
    }
  }

  /**
   * Lấy danh sách categories
   */
  async getCategories(): Promise<{ data: Array<{ id: number; name: string; slug: string }> }> {
    try {
      const response = await instance.get('/api/tours/categories');
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Không thể lấy danh sách categories');
    }
  }
}

export default new TourService();