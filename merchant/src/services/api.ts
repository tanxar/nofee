// API Service for Merchant App
// Base configuration and helper functions

const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api' // Development
  : 'https://api.nofee.gr/api'; // Production (update when deployed)

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

class ApiService {
  private baseURL: string;
  private token?: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
  }

  // Clear token
  clearToken() {
    this.token = undefined;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers: HeadersInit = {
        ...options.headers,
      };

      // Only set Content-Type if not FormData
      // React Native FormData will set Content-Type automatically with boundary
      const isFormData = options.body instanceof FormData;
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      } else {
        // Remove Content-Type for FormData - React Native handles it
        delete (headers as any)['Content-Type'];
        delete (headers as any)['content-type'];
      }

      // Add auth token if available
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
          details: data.details,
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error: any) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    // If body is FormData, don't stringify it and don't set Content-Type
    const isFormData = body instanceof FormData;
    
    // For FormData, remove Content-Type header (let browser set it with boundary)
    const headers: HeadersInit = isFormData
      ? { ...options?.headers }
      : {
          'Content-Type': 'application/json',
          ...options?.headers,
        };
    
    // Remove Content-Type from headers if FormData (React Native needs this)
    if (isFormData && headers['Content-Type']) {
      delete headers['Content-Type'];
    }
    
    return this.request<T>(endpoint, {
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
      ...options,
      headers,
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiService();

