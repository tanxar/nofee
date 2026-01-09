import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  FadeIn,
  SlideInDown,
  withSpring,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { ordersService, Order } from '../services/ordersService';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';

export default function OrderStatusScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previousStatus, setPreviousStatus] = useState<string | null>(null);

  const orderId = (route.params as { orderId?: string })?.orderId;
  const statusChangeOpacity = useSharedValue(1);

  // All hooks must be called before any early returns
  const statusCardStyle = useAnimatedStyle(() => {
    return {
      opacity: statusChangeOpacity.value,
    };
  });


  useEffect(() => {
    if (orderId) {
      loadOrder();
      // Poll for order updates every 3 seconds
      const interval = setInterval(loadOrder, 3000);
      return () => clearInterval(interval);
    } else {
      setError('Order ID not provided');
      setLoading(false);
    }
  }, [orderId]);

  const loadOrder = async () => {
    if (!orderId) return;
    
    try {
      const fetchedOrder = await ordersService.getById(orderId);
      if (fetchedOrder) {
        // Animate status change
        if (order && order.status !== fetchedOrder.status) {
          statusChangeOpacity.value = 0;
          statusChangeOpacity.value = withSpring(1, {
            damping: 15,
            stiffness: 150,
          });
          setPreviousStatus(order.status);
        }
        setOrder(fetchedOrder);
        setError(null);
      } else {
        setError('Order not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: 'time-outline',
          color: '#FF6B35',
          title: 'Αναμονή Αποδοχής',
          message: 'Το κατάστημα σύντομα θα αποδεχτεί την παραγγελία σου.',
        };
      case 'preparing':
        return {
          icon: 'restaurant-outline',
          color: '#3B82F6',
          title: 'Σε Προετοιμασία',
          message: 'Η παραγγελία σου προετοιμάζεται.',
        };
      case 'ready':
        return {
          icon: 'checkmark-circle-outline',
          color: '#10B981',
          title: 'Έτοιμο',
          message: 'Η παραγγελία σου είναι έτοιμη!',
        };
      case 'completed':
        return {
          icon: 'checkmark-done-circle',
          color: '#6B7280',
          title: 'Ολοκληρώθηκε',
          message: 'Η παραγγελία σου ολοκληρώθηκε.',
        };
      case 'cancelled':
        return {
          icon: 'close-circle',
          color: '#EF4444',
          title: 'Ακυρώθηκε',
          message: 'Η παραγγελία ακυρώθηκε.',
        };
      default:
        return {
          icon: 'help-circle-outline',
          color: '#9CA3AF',
          title: 'Άγνωστη Κατάσταση',
          message: '',
        };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Φόρτωση παραγγελίας...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>{error || 'Order not found'}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              loadOrder();
            }}
          >
            <Text style={styles.retryButtonText}>Δοκίμασε ξανά</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <LinearGradient
          colors={['#FF6B35', '#F7931E']}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              // Navigate to Home instead of going back
              (navigation as any).navigate('Home');
            }}
          >
            <Ionicons name="home-outline" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Κατάσταση Παραγγελίας</Text>
        </LinearGradient>

        {/* Status Card */}
        <Animated.View 
          entering={FadeInDown.delay(100).springify()} 
          style={[styles.statusCard, statusCardStyle]}
        >
          <Animated.View 
            entering={FadeIn.delay(150).springify()}
            style={[styles.statusIconContainer, { backgroundColor: statusInfo.color + '20' }]}
          >
            <Ionicons name={statusInfo.icon as any} size={56} color={statusInfo.color} />
          </Animated.View>
          <Animated.Text 
            entering={FadeInDown.delay(200).springify()}
            style={styles.statusTitle}
          >
            {statusInfo.title}
          </Animated.Text>
          <Animated.Text 
            entering={FadeInDown.delay(250).springify()}
            style={styles.statusMessage}
          >
            {statusInfo.message}
          </Animated.Text>
          <Animated.Text 
            entering={FadeInDown.delay(300).springify()}
            style={styles.orderNumber}
          >
            Παραγγελία #{order.orderNumber}
          </Animated.Text>
        </Animated.View>

        {/* Order Details */}
        <Animated.View entering={FadeInDown.delay(350).springify()} style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Λεπτομέρειες Παραγγελίας</Text>
          
          {order.items && order.items.length > 0 && (
            <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>Προϊόντα</Text>
              {order.items.map((item, index) => (
                <Animated.View 
                  key={item.id || index} 
                  entering={FadeInDown.delay(450 + index * 50).springify()}
                  style={styles.itemRow}
                >
                  <Text style={styles.itemName}>
                    {item.quantity}x {item.productName}
                  </Text>
                  <Text style={styles.itemPrice}>
                    €{(item.price * item.quantity).toFixed(2)}
                  </Text>
                </Animated.View>
              ))}
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Υποσύνολο</Text>
              <Text style={styles.summaryValue}>€{order.subtotal.toFixed(2)}</Text>
            </View>
            {order.deliveryFee > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Κόστος Παράδοσης</Text>
                <Text style={styles.summaryValue}>€{order.deliveryFee.toFixed(2)}</Text>
              </View>
            )}
            {order.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Έκπτωση</Text>
                <Text style={[styles.summaryValue, styles.discountValue]}>
                  -€{order.discount.toFixed(2)}
                </Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Σύνολο</Text>
              <Text style={styles.totalValue}>€{order.total.toFixed(2)}</Text>
            </View>
          </Animated.View>

          {order.deliveryAddress && (
            <Animated.View entering={FadeInDown.delay(550).springify()} style={styles.addressSection}>
              <Text style={styles.sectionTitle}>Διεύθυνση Παράδοσης</Text>
              <Text style={styles.addressText}>{order.deliveryAddress}</Text>
            </Animated.View>
          )}

          {order.customerNotes && (
            <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.notesSection}>
              <Text style={styles.sectionTitle}>Σημειώσεις</Text>
              <Text style={styles.notesText}>{order.customerNotes}</Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* Action Button */}
        <Animated.View entering={SlideInDown.delay(650).springify()} style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate('Home' as never);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.homeButtonText}>Επιστροφή στην Αρχική</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 20,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    marginTop: 28,
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 16,
    padding: 8,
    alignSelf: 'flex-start',
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  statusCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: -16,
    marginBottom: 16,
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  statusIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  statusMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  orderNumber: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  detailsCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
  },
  itemsSection: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  itemName: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
    lineHeight: 22,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
  },
  summarySection: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 2,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  discountValue: {
    color: '#10B981',
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  addressSection: {
    marginBottom: 24,
  },
  addressText: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 24,
    marginTop: 4,
  },
  notesSection: {
    marginBottom: 8,
  },
  notesText: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 24,
    marginTop: 4,
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  homeButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  homeButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

