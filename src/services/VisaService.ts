import instance from '../../axiosConfig';
import { VisaService, VisaServiceSummary, VisaServiceApiResponse, mapApiResponseToVisaService } from '../data/VisaService';

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
      console.log('API Response for getAll:', response.data);
      console.log('Response data:', responseData);
      const mapped: VisaServiceSummary[] = (responseData.data || []).map((item: any) => ({
        id: item.id || 0, // Database ID (number)
        slug: item.slug || '', // URL slug (string)
        title: item.title,
        countryName: item.country || item.countryName || item.country_name || '-',
        successRate: item.success_rate || item.successRate || '-',
        processingTime: item.processing_time || item.processingTime || '-',
        status: (item.status as 'active' | 'inactive') || 'active',
        createdAt: item.created_at || item.createdAt || new Date().toISOString(),
      }));
      return {
        data: mapped,
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
      console.log('API Response:', response.data);
      const apiData: VisaServiceApiResponse = response.data.data.data;
      return mapApiResponseToVisaService(apiData);
    } catch (error) {
      console.error(`Error fetching visa service with slug ${slug}:`, error);
      throw error;
    }
  }

  async create(serviceData: Omit<VisaService, 'id' | 'createdAt' | 'updatedAt'>): Promise<VisaService> {
    try {
      const response = await instance.post(API_URL + '/create', serviceData);
      return response.data.data.data;
    } catch (error) {
      console.error('Error creating visa service:', error);
      throw error;
    }
  }

  async update(slug: string, serviceData: Partial<VisaService>): Promise<VisaService> {
    try {
      // Create FormData for the request
      const formData = new FormData();
      formData.append('slug', slug);
      
      // Append all service data fields
      Object.keys(serviceData).forEach(key => {
        const value = serviceData[key as keyof VisaService];
        if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });
      
      const response = await instance.post(`${API_URL}/update`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data.data;
    } catch (error) {
      console.error(`Error updating visa service with slug ${slug}:`, error);
      throw error;
    }
  }

  async changeStatus(id: number, status: 'active' | 'inactive'): Promise<VisaService> {
    try {
        // Ensure status is exactly 'active' or 'inactive' (trim any extra characters)
        const cleanStatus = status.trim() as 'active' | 'inactive';
        console.log('Changing status for ID:', id, 'to:', cleanStatus);
        
        const response = await instance.patch(`${API_URL}/by-id/${id}/status`, { status: cleanStatus });
        console.log('Change status response:', response.data);
        // Response format: { status: "success", message: "...", data: { id, title, oldStatus, newStatus } }
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
