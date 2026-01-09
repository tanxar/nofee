import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Order, OrderStatus } from '../services/ordersService';
import { ordersService } from '../services/ordersService';
import { websocketService } from '../services/websocket';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';

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

  // WebSocket connection and listeners
  useEffect(() => {
    if (!storeId) {
      return;
    }

    // Connect to WebSocket
    websocketService.connect(storeId);

    // Listen for new orders
    const handleNewOrder = (newOrder: any) => {
      console.log('📦 New order received via WebSocket:', newOrder);
      
      // Convert Decimal strings to numbers
      const convertedOrder: Order = {
        ...newOrder,
        subtotal: typeof newOrder.subtotal === 'string' ? Number(newOrder.subtotal) : newOrder.subtotal,
        deliveryFee: typeof newOrder.deliveryFee === 'string' ? Number(newOrder.deliveryFee) : newOrder.deliveryFee,
        discount: typeof newOrder.discount === 'string' ? Number(newOrder.discount) : newOrder.discount,
        total: typeof newOrder.total === 'string' ? Number(newOrder.total) : newOrder.total,
        items: newOrder.items?.map((item: any) => ({
          ...item,
          price: typeof item.price === 'string' ? Number(item.price) : item.price,
        })) || [],
      };
      
      // Add to orders list if not already present
      setOrders((prevOrders) => {
        const exists = prevOrders.some((o) => o.id === convertedOrder.id);
        if (exists) {
          return prevOrders.map((o) => (o.id === convertedOrder.id ? convertedOrder : o));
        }
        return [convertedOrder, ...prevOrders];
      });

      // Show notification
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: 'success',
        text1: 'Νέα Παραγγελία! 🎉',
        text2: `Παραγγελία #${convertedOrder.orderNumber} - €${convertedOrder.total.toFixed(2)}`,
        visibilityTime: 5000,
      });
    };

    // Listen for order updates
    const handleOrderUpdate = (updatedOrder: any) => {
      console.log('📦 Order updated via WebSocket:', updatedOrder);
      
      // Convert Decimal strings to numbers
      const convertedOrder: Order = {
        ...updatedOrder,
        subtotal: typeof updatedOrder.subtotal === 'string' ? Number(updatedOrder.subtotal) : updatedOrder.subtotal,
        deliveryFee: typeof updatedOrder.deliveryFee === 'string' ? Number(updatedOrder.deliveryFee) : updatedOrder.deliveryFee,
        discount: typeof updatedOrder.discount === 'string' ? Number(updatedOrder.discount) : updatedOrder.discount,
        total: typeof updatedOrder.total === 'string' ? Number(updatedOrder.total) : updatedOrder.total,
        items: updatedOrder.items?.map((item: any) => ({
          ...item,
          price: typeof item.price === 'string' ? Number(item.price) : item.price,
        })) || [],
      };
      
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === convertedOrder.id ? convertedOrder : order
        )
      );
    };

    websocketService.on('new-order', handleNewOrder);
    websocketService.on('order-updated', handleOrderUpdate);

    // Cleanup on unmount or storeId change
    return () => {
      websocketService.off('new-order', handleNewOrder);
      websocketService.off('order-updated', handleOrderUpdate);
      websocketService.disconnect();
    };
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
