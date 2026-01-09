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

// Helper function to convert Decimal strings to numbers
const convertOrderToNumber = (order: any): Order => {
  return {
    ...order,
    subtotal: typeof order.subtotal === 'string' ? Number(order.subtotal) : order.subtotal,
    deliveryFee: typeof order.deliveryFee === 'string' ? Number(order.deliveryFee) : order.deliveryFee,
    discount: typeof order.discount === 'string' ? Number(order.discount) : order.discount,
    total: typeof order.total === 'string' ? Number(order.total) : order.total,
    items: order.items?.map((item: any) => ({
      ...item,
      price: typeof item.price === 'string' ? Number(item.price) : item.price,
    })) || [],
  };
};

export const ordersService = {
  // Create new order
  async create(orderData: CreateOrderInput): Promise<Order | null> {
    const response = await api.post<Order>('/orders', orderData);
    if (!response.data) return null;
    return convertOrderToNumber(response.data);
  },

  // Get order by ID
  async getById(orderId: string): Promise<Order | null> {
    const response = await api.get<Order>(`/orders/${orderId}`);
    if (!response.data) return null;
    return convertOrderToNumber(response.data);
  },

  // Get orders by customer
  async getByCustomer(customerId: string): Promise<Order[]> {
    const response = await api.get<Order[]>(`/orders?customerId=${customerId}`);
    const orders = response.data || [];
    return orders.map(convertOrderToNumber);
  },
};

