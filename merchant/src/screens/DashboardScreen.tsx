import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useOrders } from '../context/OrdersContext';
import { useProducts } from '../context/ProductsContext';
import { mockStats, mockRevenueData, OrderStatus } from '../data/mockData';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { orders } = useOrders();
  const { products } = useProducts();
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const stats = {
    todayRevenue: orders
      .filter((o) => o.status === 'completed' && isToday(new Date(o.createdAt)))
      .reduce((sum, o) => sum + o.total, 0),
    todayOrders: orders.filter((o) => isToday(new Date(o.createdAt))).length,
    pendingOrders: orders.filter((o) => o.status === 'pending').length,
    preparingOrders: orders.filter((o) => o.status === 'preparing').length,
    readyOrders: orders.filter((o) => o.status === 'ready').length,
    totalProducts: products.length,
    availableProducts: products.filter((p) => p.available).length,
    averageOrderValue: orders.length > 0
      ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length
      : 0,
  };

  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const revenueData = timeRange === 'today' 
    ? [{ date: 'Today', revenue: stats.todayRevenue, orders: stats.todayOrders }]
    : timeRange === 'week'
    ? mockRevenueData.slice(-7)
    : mockRevenueData;

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
        return 'Εκκρεμεί';
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
  };

  // Simple bar chart component
  const BarChart = ({ data }: { data: typeof mockRevenueData }) => {
    const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {data.map((item, index) => {
            const height = (item.revenue / maxRevenue) * 100;
            return (
              <View key={index} style={styles.barWrapper}>
                <View style={styles.barContainer}>
                  <LinearGradient
                    colors={['#FF6B35', '#FF8C5A']}
                    style={[styles.bar, { height: `${height}%` }]}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                  />
                </View>
                <Text style={styles.barLabel}>
                  {item.date.split('-')[2] || item.date}
                </Text>
                <Text style={styles.barValue}>€{item.revenue.toFixed(0)}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {new Date().getHours() < 12 ? 'Καλημέρα' : 
               new Date().getHours() < 18 ? 'Καλησπέρα' : 'Καληνύχτα'}!
            </Text>
            <Text style={styles.restaurantName}>Το Μαγαζί σας</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile' as never)}
            style={styles.settingsButton}
          >
            <Ionicons name="settings-outline" size={24} color="#1F2937" />
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Stats */}
        <View style={styles.quickStatsContainer}>
          <Animated.View entering={FadeInRight.delay(200)} style={styles.quickStatCard}>
            <LinearGradient
              colors={['#FF6B35', '#FF8C5A']}
              style={styles.quickStatGradient}
            >
              <Ionicons name="cash-outline" size={20} color="#FFF" />
            </LinearGradient>
            <View style={styles.quickStatContent}>
              <Text style={styles.quickStatValue}>€{stats.todayRevenue.toFixed(2)}</Text>
              <Text style={styles.quickStatLabel}>Σήμερα</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInRight.delay(300)} style={styles.quickStatCard}>
            <LinearGradient
              colors={['#3B82F6', '#60A5FA']}
              style={styles.quickStatGradient}
            >
              <Ionicons name="receipt-outline" size={20} color="#FFF" />
            </LinearGradient>
            <View style={styles.quickStatContent}>
              <Text style={styles.quickStatValue}>{stats.todayOrders}</Text>
              <Text style={styles.quickStatLabel}>Παραγγελίες</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInRight.delay(400)} style={styles.quickStatCard}>
            <LinearGradient
              colors={['#10B981', '#34D399']}
              style={styles.quickStatGradient}
            >
              <Ionicons name="time-outline" size={20} color="#FFF" />
            </LinearGradient>
            <View style={styles.quickStatContent}>
              <Text style={styles.quickStatValue}>
                {stats.pendingOrders + stats.preparingOrders + stats.readyOrders}
              </Text>
              <Text style={styles.quickStatLabel}>Ενεργές</Text>
            </View>
          </Animated.View>
        </View>

        {/* Order Status Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Κατάσταση Παραγγελιών</Text>
          <View style={styles.statusOverview}>
            <TouchableOpacity
              style={[styles.statusCard, { borderLeftColor: '#FF6B35' }]}
              onPress={() => navigation.navigate('Orders' as never)}
            >
              <Text style={styles.statusNumber}>{stats.pendingOrders}</Text>
              <Text style={styles.statusLabel}>Εκκρεμεί</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statusCard, { borderLeftColor: '#3B82F6' }]}
              onPress={() => navigation.navigate('Orders' as never)}
            >
              <Text style={styles.statusNumber}>{stats.preparingOrders}</Text>
              <Text style={styles.statusLabel}>Σε προετοιμασία</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statusCard, { borderLeftColor: '#10B981' }]}
              onPress={() => navigation.navigate('Orders' as never)}
            >
              <Text style={styles.statusNumber}>{stats.readyOrders}</Text>
              <Text style={styles.statusLabel}>Έτοιμο</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Revenue Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Έσοδα</Text>
            <View style={styles.timeRangeSelector}>
              {(['today', 'week', 'month'] as const).map((range) => (
                <TouchableOpacity
                  key={range}
                  style={[
                    styles.timeRangeButton,
                    timeRange === range && styles.timeRangeButtonActive,
                  ]}
                  onPress={() => setTimeRange(range)}
                >
                  <Text
                    style={[
                      styles.timeRangeText,
                      timeRange === range && styles.timeRangeTextActive,
                    ]}
                  >
                    {range === 'today' ? 'Σήμερα' : range === 'week' ? 'Εβδομάδα' : 'Μήνας'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.chartCard}>
            <BarChart data={revenueData} />
          </View>
        </View>

        {/* Additional Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="restaurant-outline" size={24} color="#8B5CF6" />
            <Text style={styles.statCardValue}>{stats.totalProducts}</Text>
            <Text style={styles.statCardLabel}>Σύνολο Προϊόντων</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />
            <Text style={styles.statCardValue}>{stats.availableProducts}</Text>
            <Text style={styles.statCardLabel}>Διαθέσιμα</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trending-up-outline" size={24} color="#3B82F6" />
            <Text style={styles.statCardValue}>€{stats.averageOrderValue.toFixed(2)}</Text>
            <Text style={styles.statCardLabel}>Μέση Παραγγελία</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star-outline" size={24} color="#F59E0B" />
            <Text style={styles.statCardValue}>4.8</Text>
            <Text style={styles.statCardLabel}>Αξιολόγηση</Text>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Πρόσφατες Παραγγελίες</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Orders' as never)}>
              <Text style={styles.seeAll}>Δείτε όλες</Text>
            </TouchableOpacity>
          </View>

          {recentOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>Δεν υπάρχουν παραγγελίες</Text>
            </View>
          ) : (
            recentOrders.map((order, index) => (
              <Animated.View
                key={order.id}
                entering={FadeInDown.delay(100 * index)}
              >
                <TouchableOpacity
                  style={styles.orderCard}
                  onPress={() => navigation.navigate('Orders' as never)}
                >
                  <View style={styles.orderHeader}>
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                      <Text style={styles.orderCustomer}>{order.customerName}</Text>
                      <Text style={styles.orderTime}>{formatTime(order.createdAt)}</Text>
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
                    <Text style={styles.orderItemsText}>
                      {order.items.length} {order.items.length === 1 ? 'προϊόν' : 'προϊόντα'}
                    </Text>
                    <Text style={styles.orderTotal}>€{order.total.toFixed(2)}</Text>
                  </View>
                  {order.deliveryType === 'delivery' && (
                    <View style={styles.deliveryBadge}>
                      <Ionicons name="car-outline" size={12} color="#6B7280" />
                      <Text style={styles.deliveryText}>Παράδοση</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 4,
  },
  settingsButton: {
    padding: 8,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickStatGradient: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  quickStatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  quickStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  quickStatLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  seeAll: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  statusOverview: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statusNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  timeRangeButtonActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  timeRangeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  timeRangeTextActive: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartContainer: {
    marginTop: 8,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 150,
    justifyContent: 'space-around',
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  barContainer: {
    width: '100%',
    height: 100,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
  },
  barValue: {
    fontSize: 9,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  orderNumber: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  orderCustomer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  orderTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItemsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  deliveryText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
});
