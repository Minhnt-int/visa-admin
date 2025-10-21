// Media data types for admin panel

export interface Media {
  id: number;
  name: string;
  url: string;
  type: 'image' | 'video';
  altText: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaSummary {
  id: number;
  name: string;
  url: string;
  type: 'image' | 'video';
  altText: string;
  createdAt: string;
}

export interface MediaFormData {
  name: string;
  url: string;
  type: 'image' | 'video';
  altText: string;
}

export interface MediaUploadResponse {
  success: boolean;
  data?: Media;
  error?: string;
}

