import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useOrders } from '../context/OrdersContext';
import { Order, OrderStatus } from '../services/ordersService';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';

export default function OrdersScreen() {
  const { orders, loading, error, refreshOrders, updateOrderStatus } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  const filteredOrders =
    filter === 'all'
      ? orders
      : orders.filter((order) => order.status === filter);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return '#FF6B35';
      case 'preparing':
        return '#3B82F6';
      case 'ready':
        return '#10B981';
      case 'completed':
        return '#6B7280';
      case 'cancelled':
        return '#EF4444';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'Αναμονή Αποδοχής';
      case 'preparing':
        return 'Σε προετοιμασία';
      case 'ready':
        return 'Έτοιμο';
      case 'completed':
        return 'Ολοκληρώθηκε';
      case 'cancelled':
        return 'Ακυρώθηκε';
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await updateOrderStatus(orderId, newStatus);
      setSelectedOrder(null);
    } catch (error) {
      // Error is handled in context
    }
  };

  const handleRejectOrder = (orderId: string, orderNumber: string) => {
    Alert.alert(
      'Απόρριψη Παραγγελίας',
      `Είστε σίγουροι ότι θέλετε να απορρίψετε την παραγγελία #${orderNumber}?`,
      [
        {
          text: 'Ακύρωση',
          style: 'cancel',
        },
        {
          text: 'Απόρριψη',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleStatusUpdate(orderId, 'cancelled');
            Toast.show({
              type: 'info',
              text1: 'Παραγγελία Απορρίφθηκε',
              text2: `Η παραγγελία #${orderNumber} απορρίφθηκε`,
            });
          },
        },
      ]
    );
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case 'pending':
        return 'preparing';
      case 'preparing':
        return 'ready';
      case 'ready':
        return 'completed';
      default:
        return null;
    }
  };

  const filters: Array<{ label: string; value: OrderStatus | 'all' }> = [
    { label: 'Όλες', value: 'all' },
    { label: 'Αναμονή Αποδοχής', value: 'pending' },
    { label: 'Σε προετοιμασία', value: 'preparing' },
    { label: 'Έτοιμο', value: 'ready' },
    { label: 'Ολοκληρώθηκε', value: 'completed' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Παραγγελίες</Text>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filterOption) => (
          <TouchableOpacity
            key={filterOption.value}
            style={[
              styles.filterChip,
              filter === filterOption.value && styles.filterChipActive,
            ]}
            onPress={() => setFilter(filterOption.value)}
          >
            <Text
              style={[
                styles.filterText,
                filter === filterOption.value && styles.filterTextActive,
              ]}
            >
              {filterOption.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      <ScrollView 
        style={styles.ordersList} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshOrders} />
        }
      >
        {loading && orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Φόρτωση...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={refreshOrders}
            >
              <Text style={styles.retryButtonText}>Δοκίμασε ξανά</Text>
            </TouchableOpacity>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>Δεν υπάρχουν παραγγελίες</Text>
          </View>
        ) : (
          filteredOrders.map((order) => {
            const nextStatus = getNextStatus(order.status);
            return (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => setSelectedOrder(order)}
              >
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderCustomer}>
                      {order.customer?.name || 'Άγνωστος πελάτης'}
                    </Text>
                    {order.customer?.phone && (
                      <Text style={styles.orderPhone}>{order.customer.phone}</Text>
                    )}
                    <Text style={styles.orderTime}>
                      {new Date(order.createdAt).toLocaleString('el-GR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(order.status) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(order.status) },
                      ]}
                    >
                      {getStatusText(order.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderItems}>
                  {order.items.map((item) => (
                    <View key={item.id} style={styles.orderItem}>
                      <Text style={styles.orderItemText}>
                        {item.quantity}x {item.productName}
                      </Text>
                      <Text style={styles.orderItemPrice}>
                        €{(item.price * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.orderFooter}>
                  <Text style={styles.orderTotal}>
                    Σύνολο: €{order.total.toFixed(2)}
                  </Text>
                  <View style={styles.actionButtonsContainer}>
                    {order.status === 'pending' && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleRejectOrder(order.id, order.orderNumber);
                        }}
                      >
                        <Ionicons name="close-circle" size={18} color="#FFF" />
                        <Text style={styles.actionButtonText}>Απόρριψη</Text>
                      </TouchableOpacity>
                    )}
                    {nextStatus && (
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          { backgroundColor: getStatusColor(nextStatus) },
                          order.status === 'pending' && styles.acceptButton,
                        ]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(order.id, nextStatus);
                        }}
                      >
                        <Text style={styles.actionButtonText}>
                          {order.status === 'pending'
                            ? 'Αποδοχή Παραγγελίας'
                            : nextStatus === 'preparing'
                            ? 'Ξεκίνα προετοιμασία'
                            : nextStatus === 'ready'
                            ? 'Σημάνει έτοιμο'
                            : 'Ολοκλήρωσε'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Order Detail Modal */}
      <Modal
        visible={selectedOrder !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedOrder(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Λεπτομέρειες Παραγγελίας</Text>
                  <TouchableOpacity onPress={() => setSelectedOrder(null)}>
                    <Ionicons name="close" size={24} color="#1F2937" />
                  </TouchableOpacity>
                </View>

                <ScrollView>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Πελάτης</Text>
                    <Text style={styles.modalText}>
                      {selectedOrder.customer?.name || 'Άγνωστος πελάτης'}
                    </Text>
                    {selectedOrder.customer?.phone && (
                      <Text style={styles.modalText}>
                        {selectedOrder.customer.phone}
                      </Text>
                    )}
                    {selectedOrder.customer?.email && (
                      <Text style={styles.modalText}>
                        {selectedOrder.customer.email}
                      </Text>
                    )}
                    {selectedOrder.deliveryAddress && (
                      <Text style={styles.modalText}>
                        {selectedOrder.deliveryAddress}
                      </Text>
                    )}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Προϊόντα</Text>
                    {selectedOrder.items.map((item) => (
                      <View key={item.id} style={styles.modalItem}>
                        <Text style={styles.modalItemText}>
                          {item.quantity}x {item.productName}
                        </Text>
                        <Text style={styles.modalItemPrice}>
                          €{(item.price * item.quantity).toFixed(2)}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {selectedOrder.notes && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Σημειώσεις</Text>
                      <Text style={styles.modalText}>{selectedOrder.notes}</Text>
                    </View>
                  )}

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Σύνολο</Text>
                    <Text style={styles.modalTotal}>
                      €{selectedOrder.total.toFixed(2)}
                    </Text>
                  </View>
                </ScrollView>

                {/* Modal Actions */}
                {selectedOrder.status === 'pending' && (
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalRejectButton]}
                      onPress={() => {
                        handleRejectOrder(selectedOrder.id, selectedOrder.orderNumber);
                        setSelectedOrder(null);
                      }}
                    >
                      <Ionicons name="close-circle" size={20} color="#FFF" />
                      <Text style={styles.modalButtonText}>Απόρριψη</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalAcceptButton]}
                      onPress={() => {
                        handleStatusUpdate(selectedOrder.id, 'preparing');
                        setSelectedOrder(null);
                      }}
                    >
                      <Text style={styles.modalButtonText}>Αποδοχή Παραγγελίας</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {selectedOrder.status !== 'pending' && getNextStatus(selectedOrder.status) && (
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[
                        styles.modalButton,
                        { backgroundColor: getStatusColor(getNextStatus(selectedOrder.status)!) },
                      ]}
                      onPress={() => {
                        handleStatusUpdate(selectedOrder.id, getNextStatus(selectedOrder.status)!);
                        setSelectedOrder(null);
                      }}
                    >
                      <Text style={styles.modalButtonText}>
                        {getNextStatus(selectedOrder.status) === 'preparing'
                          ? 'Ξεκίνα προετοιμασία'
                          : getNextStatus(selectedOrder.status) === 'ready'
                          ? 'Σημάνει έτοιμο'
                          : 'Ολοκλήρωσε'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  filtersContainer: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#FF6B35',
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFF',
  },
  ordersList: {
    flex: 1,
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderCustomer: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  orderPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  orderTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderItems: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderItemText: {
    fontSize: 14,
    color: '#4B5563',
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  orderFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    minWidth: 120,
  },
  acceptButton: {
    flex: 1,
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalItemText: {
    fontSize: 14,
    color: '#4B5563',
  },
  modalItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalTotal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  modalRejectButton: {
    backgroundColor: '#EF4444',
  },
  modalAcceptButton: {
    backgroundColor: '#10B981',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

