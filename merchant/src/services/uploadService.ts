import { api } from './api';

export interface UploadResponse {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

export const uploadService = {
  // Upload image from file
  async uploadImage(
    uri: string,
    folder?: string,
    options?: {
      width?: number;
      height?: number;
    }
  ): Promise<UploadResponse> {
    // Convert local URI to FormData
    const formData = new FormData();
    
    // Extract filename from URI
    const filename = uri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('image', {
      uri,
      name: filename,
      type,
    } as any);

    if (folder) {
      formData.append('folder', folder);
    }
    if (options?.width) {
      formData.append('width', String(options.width));
    }
    if (options?.height) {
      formData.append('height', String(options.height));
    }

    // Don't set Content-Type for FormData - React Native will set it automatically with boundary
    const response = await api.post<UploadResponse>('/upload/image', formData);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Upload failed');
    }

    return response.data;
  },

  // Upload image from URL
  async uploadFromUrl(
    url: string,
    folder?: string,
    options?: {
      width?: number;
      height?: number;
    }
  ): Promise<UploadResponse> {
    const response = await api.post<UploadResponse>('/upload/url', {
      url,
      folder,
      width: options?.width,
      height: options?.height,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Upload failed');
    }

    return response.data;
  },

  // Delete image
  async deleteImage(publicId: string): Promise<boolean> {
    const response = await api.delete(`/upload/${publicId}`);
    return response.success;
  },
};

