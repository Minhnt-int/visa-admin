import instance from '../../axiosConfig';
import { VisaService, VisaServiceSummary } from '../data/VisaService';

const API_URL = '/visa-services';

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
      sortField?: string; 
      sortOrder?: string; 
    } = {}): Promise<ApiResponse> {
    try {
      const response = await instance.get(API_URL, { params });
      // Assuming the API returns data in the shape of ApiResponse
      return response.data;
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

  async changeStatus(slug: string, status: 'published' | 'draft' | 'deleted'): Promise<VisaService> {
    try {
        const response = await instance.put(`${API_URL}/${slug}/status`, { status });
        return response.data.data;
    } catch (error) {
        console.error(`Error changing status for visa service with slug ${slug}:`, error);
        throw error;
    }
}

  async permanentlyDelete(slug: string): Promise<void> {
    try {
      await instance.delete(`${API_URL}/${slug}/permanently`);
    } catch (error) {
      console.error(`Error permanently deleting visa service with slug ${slug}:`, error);
      throw error;
    }
  }

  async restore(slug: string): Promise<VisaService> {
    try {
        const response = await instance.put(`${API_URL}/${slug}/restore`);
        return response.data.data;
    } catch (error) {
        console.error(`Error restoring visa service with slug ${slug}:`, error);
        throw error;
    }
}

}

const VisaServiceAPI = new VisaServiceClass();
export default VisaServiceAPI;
