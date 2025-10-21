import instance from '../../axiosConfig';
import { VisaService, VisaServiceSummary } from '../data/VisaService';

const API_URL = '/api/services';

// A simplified representation for API list responses
interface ApiResponse {
    data: VisaServiceSummary[];
    pagination: {
        total: number;
        page: number;
        pageSize: number;
    }
}

class VisaServiceClass {
  async getAll(params: {
      page?: number;
      limit?: number;
      search?: string;
      tags?: string;
      status?: 'active' | 'inactive';
      sortBy?: string;
      sortOrder?: string;
    } = {}): Promise<ApiResponse> {
    try {
      const response = await instance.get(API_URL, { params });
      // Backend response structure: { status, message, data: { data, total, page, limit, totalPages } }
      const responseData = response.data.data;
      return {
        data: responseData.data,
        pagination: {
          total: responseData.total,
          page: responseData.page,
          pageSize: responseData.limit,
        },
      };
    } catch (error) {
      console.error('Error fetching all visa services:', error);
      throw error;
    }
  }

  async getBySlug(slug: string): Promise<VisaService> {
    try {
      const response = await instance.get(`${API_URL}/${slug}`);
      return response.data.data; // Assuming data is nested under a 'data' key
    } catch (error) {
      console.error(`Error fetching visa service with slug ${slug}:`, error);
      throw error;
    }
  }

  async create(serviceData: Omit<VisaService, 'id' | 'createdAt' | 'updatedAt'>): Promise<VisaService> {
    try {
      const response = await instance.post(API_URL, serviceData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating visa service:', error);
      throw error;
    }
  }

  async update(slug: string, serviceData: Partial<VisaService>): Promise<VisaService> {
    try {
      const response = await instance.put(`${API_URL}/${slug}`, serviceData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating visa service with slug ${slug}:`, error);
      throw error;
    }
  }

  async changeStatus(id: number, status: 'active' | 'inactive'): Promise<VisaService> {
    try {
        const response = await instance.patch(`${API_URL}/by-id/${id}/status`, { status });
        return response.data.data;
    } catch (error) {
        console.error(`Error changing status for visa service with id ${id}:`, error);
        throw error;
    }
  }

  async getById(id: number): Promise<VisaService> {
    try {
      // First get all services and find by ID
      const response = await instance.get(API_URL);
      const service = response.data.data.find((s: any) => s.id === id);
      if (!service) {
        throw new Error(`Service with id ${id} not found`);
      }
      return service;
    } catch (error) {
      console.error(`Error fetching visa service with id ${id}:`, error);
      throw error;
    }
  }

  async permanentlyDelete(id: number): Promise<void> {
    try {
      await instance.delete(`${API_URL}?id=${id}`);
    } catch (error) {
      console.error(`Error permanently deleting visa service with id ${id}:`, error);
      throw error;
    }
  }

  async restore(id: number): Promise<VisaService> {
    try {
        // Restore by changing status back to draft
        const service = await this.getById(id);
        const response = await instance.put(`${API_URL}/${service.slug}`, { ...service, status: 'draft' });
        return response.data.data;
    } catch (error) {
        console.error(`Error restoring visa service with id ${id}:`, error);
        throw error;
    }
  }

}

const VisaServiceAPI = new VisaServiceClass();
export default VisaServiceAPI;
