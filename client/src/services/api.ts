// API Service for Client App
// Base configuration and helper functions

// For physical devices, use your computer's IP address instead of localhost
// Find your IP: ifconfig | grep "inet " | grep -v 127.0.0.1
const API_BASE_URL = __DEV__
  ? 'http://192.168.2.6:3000/api' // Development - use IP for physical devices
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
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    if (options.body) {
      try {
        console.log(`📦 Request body:`, typeof options.body === 'string' ? JSON.parse(options.body) : options.body);
      } catch {
        console.log(`📦 Request body:`, options.body);
      }
    }
    
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check if response is ok
      if (!response.ok) {
        // Try to parse error response
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        return {
          success: false,
          error: errorData.error || `Request failed with status ${response.status}`,
          details: errorData.details,
        };
      }

      // Parse successful response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        return {
          success: false,
          error: 'Invalid response from server',
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error: any) {
      console.error('API Error:', error);
      
      // Handle different error types
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout. Please check your connection and try again.',
        };
      }
      
      if (error.message && (
        error.message.includes('Network request failed') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError') ||
        error.message.includes('TypeError')
      )) {
        return {
          success: false,
          error: `Cannot connect to backend server.\n\nPlease ensure:\n• Backend is running on http://192.168.2.6:3000\n• Your device is on the same WiFi network\n• Firewall allows connections on port 3000\n\nCheck the terminal where the backend is running for errors.`,
        };
      }
      
      return {
        success: false,
        error: error.message || 'An unexpected error occurred',
      };
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
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

