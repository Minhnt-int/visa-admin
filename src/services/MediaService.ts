import instance from '../../axiosConfig';
import { Media, MediaSummary, MediaFormData, MediaUploadResponse } from '../data/Media';

const API_URL = '/api/media';

interface ApiResponse {
  data: MediaSummary[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class MediaServiceClass {
  async getAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    type?: 'image' | 'video';
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  } = {}): Promise<ApiResponse> {
    try {
      const response = await instance.get(API_URL, { params });
      // Backend returns { success, data, pagination }
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error('Error fetching all media:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<Media> {
    try {
      const response = await instance.get(`${API_URL}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching media with id ${id}:`, error);
      throw error;
    }
  }

  async upload(file: File, altText?: string): Promise<MediaUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (altText) {
        formData.append('altText', altText);
      }

      const response = await instance.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error('Error uploading media:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  async update(id: number, data: { altText: string }): Promise<Media> {
    try {
      const response = await instance.put(`${API_URL}/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating media with id ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await instance.delete(`${API_URL}/${id}`);
    } catch (error) {
      console.error(`Error deleting media with id ${id}:`, error);
      throw error;
    }
  }

  async bulkDelete(ids: number[]): Promise<void> {
    try {
      await Promise.all(ids.map((id) => this.delete(id)));
    } catch (error) {
      console.error('Error bulk deleting media:', error);
      throw error;
    }
  }
}

const MediaService = new MediaServiceClass();
export default MediaService;

