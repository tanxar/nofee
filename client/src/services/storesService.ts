import { api } from './api';

export interface Store {
  id: string;
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  openingHours?: any;
  minOrderAmount: number;
  deliveryFee: number;
  estimatedDeliveryTime: number;
  acceptsCash: boolean;
  acceptsCard: boolean;
  acceptsDigital: boolean;
  isActive: boolean;
  products?: Product[];
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
  available: boolean;
  featured: boolean;
  preparationTime?: number;
  stock?: number;
  tags?: string[];
}

export const storesService = {
  // Get all stores
  async getAll(): Promise<Store[]> {
    const response = await api.get<Store[]>('/stores?isActive=true');
    return response.data || [];
  },

  // Get store by ID
  async getById(storeId: string): Promise<Store | null> {
    const response = await api.get<Store>(`/stores/${storeId}`);
    return response.data || null;
  },

  // Get store products
  async getProducts(storeId: string): Promise<Product[]> {
    const response = await api.get<Product[]>(`/products/store/${storeId}?available=true`);
    return response.data || [];
  },
};

