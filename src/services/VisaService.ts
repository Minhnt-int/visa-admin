import instance from '../../axiosConfig';
import { VisaService, VisaServiceSummary, VisaServiceApiResponse, mapApiResponseToVisaService } from '../data/VisaService';

const API_URL = '/api/services';

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
      status?: 'active' | 'inactive' | 'all';
      sortBy?: string;
      sortOrder?: string;
    } = {}): Promise<ApiResponse> {
    try {
      const response = await instance.get(API_URL, { params });
      
      const backendData = response.data;
      
      if (!backendData || !backendData.data) {
        console.error('Invalid response structure:', backendData);
        return {
          data: [],
          pagination: { total: 0, page: 1, pageSize: params.limit || 10 }
        };
      }
      
      let responseData;
      if (backendData.data && typeof backendData.data === 'object' && 'data' in backendData.data) {
        responseData = backendData.data;
      } else if (Array.isArray(backendData.data)) {
        responseData = { data: backendData.data, total: backendData.data.length, page: 1, limit: params.limit || 10 };
      } else {
        responseData = backendData;
      }
      
      const dataArray = Array.isArray(responseData.data) ? responseData.data : [];
      
      const mapped: VisaServiceSummary[] = dataArray.map((item: any) => ({
        id: item.id || 0,
        slug: item.slug || '',
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
          total: responseData.total || 0,
          page: responseData.page || 1,
          pageSize: responseData.limit || params.limit || 10,
        },
      };
    } catch (error: any) {
      console.error('Error fetching all visa services:', error);
      return {
        data: [],
        pagination: { total: 0, page: 1, pageSize: params.limit || 10 }
      };
    }
  }

  async getBySlug(slug: string): Promise<VisaService> {
    try {
      const response = await instance.get(`${API_URL}/${slug}`);
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
      const apiData: VisaServiceApiResponse = response.data.data;
      return mapApiResponseToVisaService(apiData);
    } catch (error) {
      console.error('Error creating visa service:', error);
      throw error;
    }
  }

  async update(slug: string, serviceData: Partial<VisaService>): Promise<VisaService> {
    try {
      // Create FormData for the request
      const formData = new FormData();
      
      formData.append('id', slug);
      
      const newSlug = serviceData.slug;
      
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
      
      if (newSlug && newSlug !== slug) {
      }
      
      const response = await instance.post(`${API_URL}/update`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const apiData: VisaServiceApiResponse = response.data.data;
      return mapApiResponseToVisaService(apiData);
    } catch (error) {
      console.error(`Error updating visa service with slug ${slug}:`, error);
      throw error;
    }
  }

  async changeStatus(id: number, status: 'active' | 'inactive'): Promise<VisaService> {
    try {
        const cleanStatus = status.trim() as 'active' | 'inactive';
        
        const response = await instance.patch(`${API_URL}/by-id/${id}/status`, { status: cleanStatus });  
        return response.data.data;
    } catch (error) {
        console.error(`Error changing status for visa service with id ${id}:`, error);
        throw error;
    }
  }

  async getById(id: number): Promise<VisaService> {
    try {
      const response = await instance.get(API_URL);
      const responseData = response.data.data;
      const services = responseData.data || [];
      const service = services.find((s: any) => s.id === id);
      if (!service) {
        throw new Error(`Service with id ${id} not found`);
      }
      return mapApiResponseToVisaService(service);
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
