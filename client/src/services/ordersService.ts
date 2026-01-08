import { api } from './api';

export interface OrderItem {
  productId?: string;
  productName: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface CreateOrderInput {
  customerId?: string;
  storeId: string;
  paymentMethod?: 'card' | 'cash' | 'digital';
  deliveryType?: 'delivery' | 'pickup';
  deliveryAddress?: string;
  customerNotes?: string;
  items: OrderItem[];
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  storeId: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
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
  items?: any[];
  store?: any;
  customer?: any;
}

export const ordersService = {
  // Create new order
  async create(orderData: CreateOrderInput): Promise<Order | null> {
    const response = await api.post<Order>('/orders', orderData);
    return response.data || null;
  },

  // Get order by ID
  async getById(orderId: string): Promise<Order | null> {
    const response = await api.get<Order>(`/orders/${orderId}`);
    return response.data || null;
  },

  // Get orders by customer
  async getByCustomer(customerId: string): Promise<Order[]> {
    const response = await api.get<Order[]>(`/orders?customerId=${customerId}`);
    return response.data || [];
  },
};

