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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { mockStats, mockRevenueData } from '../data/mockData';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  const stats = {
    ...mockStats,
    topProducts: [
      { name: 'Σουβλάκι', orders: 45, revenue: 202.50 },
      { name: 'Μπέργκερ Κλασικό', orders: 32, revenue: 400.00 },
      { name: 'Πίτσα Μαργαρίτα', orders: 28, revenue: 420.00 },
    ],
    peakHours: [
      { hour: '12:00', orders: 15 },
      { hour: '13:00', orders: 22 },
      { hour: '19:00', orders: 18 },
      { hour: '20:00', orders: 20 },
    ],
  };

  const revenueData = timeRange === 'week' 
    ? mockRevenueData.slice(-7)
    : timeRange === 'month'
    ? mockRevenueData
    : [...mockRevenueData, ...mockRevenueData, ...mockRevenueData]; // Mock year data

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
        <View style={styles.header}>
          <Text style={styles.title}>Αναλυτικά</Text>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {(['week', 'month', 'year'] as const).map((range) => (
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
                {range === 'week' ? 'Εβδομάδα' : range === 'month' ? 'Μήνας' : 'Έτος'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Revenue Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Έσοδα</Text>
          <View style={styles.revenueCard}>
            <Text style={styles.revenueAmount}>
              €{stats.monthlyRevenue.toFixed(2)}
            </Text>
            <Text style={styles.revenueLabel}>Συνολικά Έσοδα</Text>
            <View style={styles.revenueChange}>
              <Ionicons name="trending-up" size={16} color="#10B981" />
              <Text style={styles.revenueChangeText}>+12.5% από προηγούμενο μήνα</Text>
            </View>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Γράφημα Εσόδων</Text>
          <View style={styles.chartCard}>
            <BarChart data={revenueData} />
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Βασικά Μετρικά</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Ionicons name="receipt-outline" size={24} color="#3B82F6" />
              <Text style={styles.metricValue}>{stats.monthlyOrders}</Text>
              <Text style={styles.metricLabel}>Παραγγελίες</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons name="cash-outline" size={24} color="#10B981" />
              <Text style={styles.metricValue}>€{stats.averageOrderValue.toFixed(2)}</Text>
              <Text style={styles.metricLabel}>Μέση Παραγγελία</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#8B5CF6" />
              <Text style={styles.metricValue}>{stats.completionRate}%</Text>
              <Text style={styles.metricLabel}>Ολοκλήρωση</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons name="star-outline" size={24} color="#F59E0B" />
              <Text style={styles.metricValue}>4.8</Text>
              <Text style={styles.metricLabel}>Αξιολόγηση</Text>
            </View>
          </View>
        </View>

        {/* Top Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Κορυφαία Προϊόντα</Text>
          {stats.topProducts.map((product, index) => (
            <Animated.View
              key={index}
              entering={FadeInDown.delay(100 * index)}
              style={styles.productCard}
            >
              <View style={styles.productRank}>
                <Text style={styles.productRankText}>#{index + 1}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDetails}>
                  {product.orders} παραγγελίες • €{product.revenue.toFixed(2)}
                </Text>
              </View>
              <View style={styles.productRevenue}>
                <Text style={styles.productRevenueText}>€{product.revenue.toFixed(2)}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Peak Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ώρες Αναμονής</Text>
          {stats.peakHours.map((hour, index) => (
            <View key={index} style={styles.hourCard}>
              <View style={styles.hourInfo}>
                <Ionicons name="time-outline" size={20} color="#6B7280" />
                <Text style={styles.hourText}>{hour.hour}</Text>
              </View>
              <View style={styles.hourBarContainer}>
                <View
                  style={[
                    styles.hourBar,
                    {
                      width: `${(hour.orders / 25) * 100}%`,
                      backgroundColor: '#FF6B35',
                    },
                  ]}
                />
              </View>
              <Text style={styles.hourOrders}>{hour.orders}</Text>
            </View>
          ))}
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
  timeRangeContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#FF6B35',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  timeRangeTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  revenueCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  revenueAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  revenueLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  revenueChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  revenueChangeText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
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
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productRankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productDetails: {
    fontSize: 12,
    color: '#6B7280',
  },
  productRevenue: {
    marginLeft: 12,
  },
  productRevenueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  hourCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  hourInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
    gap: 8,
  },
  hourText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  hourBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  hourBar: {
    height: '100%',
    borderRadius: 4,
  },
  hourOrders: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    width: 30,
    textAlign: 'right',
  },
});

