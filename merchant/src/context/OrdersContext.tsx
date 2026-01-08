import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, OrderStatus } from '../services/ordersService';
import { ordersService } from '../services/ordersService';
import Toast from 'react-native-toast-message';

interface OrdersContextType {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refreshOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getOrderById: (orderId: string) => Order | undefined;
  // Store ID for filtering (will be set from auth/store context later)
  storeId?: string;
  setStoreId: (id: string) => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | undefined>(undefined);

  // Fetch orders from API
  const refreshOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedOrders = await ordersService.getAll(
        storeId ? { storeId } : undefined
      );
      setOrders(fetchedOrders);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    refreshOrders();
  }, [storeId]);

  // Update order status via API
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const updatedOrder = await ordersService.updateStatus(orderId, status);
      if (updatedOrder) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? updatedOrder : order
          )
        );
        Toast.show({
          type: 'success',
          text1: 'Ενημερώθηκε',
          text2: `Η παραγγελία ${status === 'completed' ? 'ολοκληρώθηκε' : 'ενημερώθηκε'}`,
        });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Σφάλμα',
        text2: err.message || 'Αποτυχία ενημέρωσης παραγγελίας',
      });
      throw err;
    }
  };

  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter((order) => order.status === status);
  };

  const getOrderById = (orderId: string) => {
    return orders.find((order) => order.id === orderId);
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        loading,
        error,
        refreshOrders,
        updateOrderStatus,
        getOrdersByStatus,
        getOrderById,
        storeId,
        setStoreId,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}
