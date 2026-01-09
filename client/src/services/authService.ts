import { api } from './api';

export interface User {
  id: string;
  email: string;
  role: 'merchant' | 'customer';
  name: string | null;
  phone: string | null;
}

export interface RegisterInput {
  email: string;
  password: string;
  role: 'merchant' | 'customer';
  name?: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  // Register new user
  async register(data: RegisterInput): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Registration failed');
    }
    return response.data;
  },

  // Login user
  async login(data: LoginInput): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Login failed');
    }
    return response.data;
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const response = await api.get<User>('/auth/me');
    return response.data || null;
  },
};

