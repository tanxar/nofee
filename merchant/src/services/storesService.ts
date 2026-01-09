import { api } from './api';

export interface Store {
  id: string;
  merchantId: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface StoreStats {
  totalOrders: number;
  completedOrders: number;
  totalProducts: number;
  totalRevenue: number;
}

export interface CreateStoreInput {
  merchantId: string;
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  openingHours?: any;
  minOrderAmount?: number;
  deliveryFee?: number;
  estimatedDeliveryTime?: number;
  acceptsCash?: boolean;
  acceptsCard?: boolean;
  acceptsDigital?: boolean;
}

export const storesService = {
  // Get store by ID
  async getById(storeId: string): Promise<Store | null> {
    const response = await api.get<Store>(`/stores/${storeId}`);
    return response.data || null;
  },

  // Get stores by merchant
  async getByMerchant(merchantId: string): Promise<Store[]> {
    const response = await api.get<Store[]>(`/stores/merchant/${merchantId}`);
    return response.data || [];
  },

  // Get store statistics
  async getStats(storeId: string): Promise<StoreStats | null> {
    const response = await api.get<StoreStats>(`/stores/${storeId}/stats`);
    return response.data || null;
  },

  // Create store
  async create(storeData: CreateStoreInput): Promise<Store | null> {
    const response = await api.post<Store>('/stores', storeData);
    return response.data || null;
  },

  // Update store
  async update(storeId: string, updates: Partial<Store>): Promise<Store | null> {
    const response = await api.patch<Store>(`/stores/${storeId}`, updates);
    return response.data || null;
  },
};

