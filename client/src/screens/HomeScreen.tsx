import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { restaurants, categories, Restaurant } from '../data/mockData';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useStores } from '../context/StoresContext';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const { getTotalItems, clearCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { stores, loading: storesLoading, refreshStores } = useStores();
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'deliveryTime' | 'price'>('rating');
  const [showFilters, setShowFilters] = useState(false);
  const clearCartRef = useRef(clearCart);
  
  // Update ref when clearCart changes
  useEffect(() => {
    clearCartRef.current = clearCart;
  }, [clearCart]);

  // Convert backend stores to Restaurant format
  const backendStoresAsRestaurants: Restaurant[] = stores.map((store) => ({
    id: store.id,
    name: store.name,
    cuisine: store.description || 'Γρήγορο Φαγητό',
    rating: 4.5, // Default rating
    deliveryTime: `${store.estimatedDeliveryTime}-${store.estimatedDeliveryTime + 10} λεπτά`,
    deliveryFee: Number(store.deliveryFee),
    minOrder: Number(store.minOrderAmount),
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', // Default image
    distance: '1.0 km', // Default distance
    isPromoted: false,
  }));

  // Combine mock restaurants with backend stores
  const allRestaurants = [...restaurants, ...backendStoresAsRestaurants];

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshStores();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [refreshStores]);

  // Καθαρισμός καλαθιού όταν επιστρέφει στην αρχική
  useFocusEffect(
    React.useCallback(() => {
      clearCartRef.current();
    }, []) // Empty dependency array - τρέχει μόνο όταν το screen γίνεται focused
  );

  // Error handling
  if (!allRestaurants || allRestaurants.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Δεν βρέθηκαν εστιατόρια</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Filter and sort restaurants
  let filteredRestaurants = selectedCategory === '1'
    ? allRestaurants
    : allRestaurants.filter((r) => {
        const categoryName = categories.find((c) => c.id === selectedCategory)?.name;
        return r.cuisine.toLowerCase().includes(categoryName?.toLowerCase() || '');
      });

  // Search filter
  if (searchQuery.trim()) {
    filteredRestaurants = filteredRestaurants.filter((r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sort
  filteredRestaurants = [...filteredRestaurants].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'deliveryTime':
        const aTime = parseInt(a.deliveryTime.split('-')[0]);
        const bTime = parseInt(b.deliveryTime.split('-')[0]);
        return aTime - bTime;
      case 'price':
        return a.deliveryFee - b.deliveryFee;
      default:
        return 0;
    }
  });

  const promotedRestaurants = allRestaurants.filter((r) => r.isPromoted);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B35" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Γεια σας!</Text>
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={16} color="#6B7280" />
                <Text style={styles.location}>Αθήνα, Κέντρο</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => {
                try {
                  (navigation as any).navigate('Profile');
                } catch (e) {
                  console.error('Navigation error:', e);
                }
              }}
            >
              <Ionicons name="person-outline" size={24} color="#111827" />
            </TouchableOpacity>
          </View>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Αναζήτηση εστιατορίου..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filters */}
          <View style={styles.filtersContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersScrollContent}
            >
              <TouchableOpacity
                style={[styles.filterButton, sortBy === 'rating' && styles.filterButtonActive]}
                onPress={() => setSortBy('rating')}
              >
                <Ionicons 
                  name="star" 
                  size={16} 
                  color={sortBy === 'rating' ? '#FFFFFF' : '#6B7280'} 
                  style={styles.filterIcon}
                />
                <Text style={[styles.filterText, sortBy === 'rating' && styles.filterTextActive]}>
                  Καλύτερη Βαθμολογία
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, sortBy === 'deliveryTime' && styles.filterButtonActive]}
                onPress={() => setSortBy('deliveryTime')}
              >
                <Ionicons 
                  name="time-outline" 
                  size={16} 
                  color={sortBy === 'deliveryTime' ? '#FFFFFF' : '#6B7280'} 
                  style={styles.filterIcon}
                />
                <Text style={[styles.filterText, sortBy === 'deliveryTime' && styles.filterTextActive]}>
                  Γρηγορότερη Παράδοση
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, sortBy === 'price' && styles.filterButtonActive]}
                onPress={() => setSortBy('price')}
              >
                <Ionicons 
                  name="cash-outline" 
                  size={16} 
                  color={sortBy === 'price' ? '#FFFFFF' : '#6B7280'} 
                  style={styles.filterIcon}
                />
                <Text style={[styles.filterText, sortBy === 'price' && styles.filterTextActive]}>
                  Χαμηλότερη Τιμή
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>

        {/* Promotions Banner */}
        <View style={styles.promotionBanner}>
          <LinearGradient
            colors={['#FF6B35', '#FF8C5A']}
            style={styles.promotionGradient}
          >
            <View style={styles.promotionContent}>
              <Ionicons name="gift-outline" size={32} color="#FFFFFF" />
              <View style={styles.promotionTextContainer}>
                <Text style={styles.promotionTitle}>Ειδική Προσφορά!</Text>
                <Text style={styles.promotionSubtitle}>Δωρεάν παράδοση για παραγγελίες άνω των €20</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Promoted Section */}
        {promotedRestaurants.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="star" size={20} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Προτεινόμενα</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promotedScroll}>
              {promotedRestaurants.map((restaurant, index) => (
                <Animated.View
                  key={restaurant.id}
                  entering={FadeInRight.delay(index * 100).springify()}
                >
                  <TouchableOpacity
                    style={styles.promotedCard}
                    onPress={() => {
                      try {
                        (navigation as any).navigate('Restaurant', { restaurantId: restaurant.id });
                      } catch (e) {
                        console.error('Navigation error:', e);
                      }
                    }}
                  >
                  <Image source={{ uri: restaurant.image }} style={styles.promotedImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.promotedGradient}
                  >
                    <Text style={styles.promotedName}>{restaurant.name}</Text>
                    <Text style={styles.promotedCuisine}>{restaurant.cuisine}</Text>
                  </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="grid-outline" size={20} color="#111827" />
            <Text style={styles.sectionTitle}>Κατηγορίες</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.categoryCardActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={32} 
                  color={selectedCategory === category.id ? '#FFFFFF' : '#FF6B35'} 
                />
                <Text
                  style={[
                    styles.categoryName,
                    selectedCategory === category.id && styles.categoryNameActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Restaurants List */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="restaurant-outline" size={20} color="#111827" />
            <Text style={styles.sectionTitle}>Εστιατόρια</Text>
          </View>
          {filteredRestaurants.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="restaurant-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Δεν βρέθηκαν εστιατόρια</Text>
              <Text style={styles.emptyText}>Δοκίμασε άλλη κατηγορία</Text>
            </View>
          ) : (
            filteredRestaurants.map((restaurant, index) => (
              <Animated.View
                key={restaurant.id}
                entering={FadeInDown.delay(index * 50).springify()}
              >
                <TouchableOpacity
                  style={styles.restaurantCard}
                  onPress={() => {
                    try {
                      (navigation as any).navigate('Restaurant', { restaurantId: restaurant.id });
                    } catch (e) {
                      console.error('Navigation error:', e);
                    }
                  }}
                >
              <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={(e) => {
                  e.stopPropagation();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  toggleFavorite(restaurant.id);
                }}
              >
                <Ionicons 
                  name={isFavorite(restaurant.id) ? 'heart' : 'heart-outline'} 
                  size={20} 
                  color={isFavorite(restaurant.id) ? '#EF4444' : '#6B7280'} 
                />
              </TouchableOpacity>
              <View style={styles.restaurantInfo}>
                <View style={styles.restaurantHeader}>
                  <View style={styles.restaurantNameContainer}>
                    <Text style={styles.restaurantName}>{restaurant.name}</Text>
                    {restaurant.isPromoted && (
                      <View style={styles.promotedBadge}>
                        <Ionicons name="star" size={14} color="#FF6B35" />
                      </View>
                    )}
                  </View>
                </View>
                <Text style={styles.restaurantCuisine}>{restaurant.cuisine}</Text>
                <View style={styles.restaurantDetails}>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#92400E" />
                    <Text style={styles.rating}> {restaurant.rating}</Text>
                  </View>
                  <View style={styles.detailBadge}>
                    <Ionicons name="time-outline" size={14} color="#374151" />
                    <Text style={styles.detailBadgeText}> {restaurant.deliveryTime}</Text>
                  </View>
                  <View style={styles.detailBadge}>
                    <Ionicons name="location-outline" size={14} color="#374151" />
                    <Text style={styles.detailBadgeText}> {restaurant.distance}</Text>
                  </View>
                </View>
                <View style={styles.restaurantFooter}>
                  <View style={styles.footerLeft}>
                    <View style={styles.deliveryFeeContainer}>
                      <View style={styles.deliveryFeeRow}>
                        {restaurant.deliveryFee === 0 ? (
                          <Ionicons name="gift-outline" size={16} color="#FF6B35" />
                        ) : (
                          <Ionicons name="cash-outline" size={16} color="#FF6B35" />
                        )}
                        <Text style={styles.deliveryFee}>
                          {restaurant.deliveryFee === 0 ? 'Δωρεάν' : `€${restaurant.deliveryFee.toFixed(2)}`} παράδοση
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.minOrder}>Ελάχ. €{restaurant.minOrder.toFixed(2)}</Text>
                  </View>
                  {restaurant.isPromoted && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>-20%</Text>
                    </View>
                  )}
                </View>
              </View>
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
    backgroundColor: '#FAFAFA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 24,
    marginBottom: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    marginLeft: 4,
  },
  filtersContainer: {
    marginTop: 8,
  },
  filtersScrollContent: {
    paddingHorizontal: 24,
    paddingRight: 24,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterIcon: {
    marginRight: 2,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  location: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  cartButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    elevation: 4,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cartIcon: {
    fontSize: 24,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    elevation: 3,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  section: {
    marginTop: 28,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  promotedScroll: {
    paddingLeft: 20,
  },
  promotedCard: {
    width: width * 0.78,
    height: 220,
    borderRadius: 24,
    marginRight: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  promotedImage: {
    width: '100%',
    height: '100%',
  },
  promotedGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 40,
  },
  promotedName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  promotedCuisine: {
    fontSize: 15,
    color: '#FFFFFF',
    marginTop: 6,
    fontWeight: '500',
    opacity: 0.95,
  },
  categoriesScroll: {
    paddingLeft: 24,
  },
  categoryCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginRight: 12,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    minWidth: 110,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  categoryCardActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
    elevation: 6,
    shadowColor: '#FF6B35',
    shadowOpacity: 0.25,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    letterSpacing: 0.2,
  },
  categoryNameActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  restaurantCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginBottom: 14,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    position: 'relative',
  },
  restaurantImage: {
    width: 120,
    height: 120,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  favoriteIcon: {
    fontSize: 22,
  },
  restaurantInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  restaurantNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.2,
  },
  promotedBadge: {
    marginLeft: 6,
  },
  promotedBadgeText: {
    fontSize: 18,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  restaurantDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
    flexWrap: 'wrap',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 3,
  },
  rating: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 3,
  },
  detailBadgeText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  deliveryTime: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  distance: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  restaurantFooter: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerLeft: {
    flex: 1,
  },
  deliveryFeeContainer: {
    marginBottom: 3,
  },
  deliveryFeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  deliveryFee: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B35',
  },
  minOrder: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  discountBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },
  promotionBanner: {
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  promotionGradient: {
    padding: 20,
  },
  promotionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  promotionTextContainer: {
    flex: 1,
  },
  promotionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  promotionSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.95,
    fontWeight: '500',
  },
});

