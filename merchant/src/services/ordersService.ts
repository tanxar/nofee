import { api } from './api';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  storeId: string;
  status: OrderStatus;
  paymentMethod?: 'card' | 'cash' | 'digital';
  deliveryType?: 'delivery' | 'pickup';
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  deliveryAddress?: string;
  customerNotes?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  customer?: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  store?: any;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string;
  productName: string;
  quantity: number;
  price: number;
  notes?: string;
}

export const ordersService = {
  // Get all orders
  async getAll(filters?: {
    storeId?: string;
    status?: OrderStatus;
  }): Promise<Order[]> {
    const params = new URLSearchParams();
    if (filters?.storeId) params.append('storeId', filters.storeId);
    if (filters?.status) params.append('status', filters.status);

    const query = params.toString();
    const endpoint = query ? `/orders?${query}` : '/orders';
    const response = await api.get<Order[]>(endpoint);
    return response.data || [];
  },

  // Get order by ID
  async getById(orderId: string): Promise<Order | null> {
    const response = await api.get<Order>(`/orders/${orderId}`);
    return response.data || null;
  },

  // Get orders by store
  async getByStore(storeId: string, status?: OrderStatus): Promise<Order[]> {
    const endpoint = status
      ? `/orders/store/${storeId}?status=${status}`
      : `/orders/store/${storeId}`;
    const response = await api.get<Order[]>(endpoint);
    return response.data || [];
  },

  // Get orders by status
  async getByStatus(status: OrderStatus, storeId?: string): Promise<Order[]> {
    const endpoint = storeId
      ? `/orders/status/${status}?storeId=${storeId}`
      : `/orders/status/${status}`;
    const response = await api.get<Order[]>(endpoint);
    return response.data || [];
  },

  // Update order status
  async updateStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    const response = await api.patch<Order>(`/orders/${orderId}/status`, { status });
    return response.data || null;
  },
};

