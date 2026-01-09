import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation, useFocusEffect, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, { 
  FadeInDown, 
  FadeInRight, 
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  useDerivedValue,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { restaurants, menuItems, Restaurant, MenuItem, MenuItemExtra } from '../data/mockData';
import { useCart } from '../context/CartContext';
import { useStores } from '../context/StoresContext';
import CartModal from '../components/CartModal';
import ProductModal from '../components/ProductModal';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function RestaurantScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // Store restaurantId in state to avoid accessing route.params during render
  const [restaurantId, setRestaurantId] = useState<string | undefined>(undefined);
  
  // Extract restaurantId from route params after component mounts
  useEffect(() => {
    try {
      const params = route.params as { restaurantId?: string } | undefined;
      const id = params?.restaurantId;
      if (id && typeof id === 'string') {
        setRestaurantId(id);
      }
    } catch (e) {
      console.error('Error accessing route params:', e);
    }
  }, []);
  
  const { addToCart, getTotalItems, cartItems } = useCart();
  const { getStoreById, getStoreProducts, stores } = useStores();
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [isScrolling, setIsScrolling] = useState(false);
  const [isNavSticky, setIsNavSticky] = useState(false);
  const [stickyNavPointerEvents, setStickyNavPointerEvents] = useState<'auto' | 'none'>('none');
  const [backendProducts, setBackendProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const categoryRefs = useRef<{ [key: string]: View | null }>({});
  const categoryHeights = useRef<{ [key: string]: number }>({});
  const categoryAbsolutePositions = useRef<{ [key: string]: number }>({});
  const categoryNavRefForLayout = useRef<View | null>(null);
  const categoryNavYPosition = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const stickyOpacity = useSharedValue(0);
  const stickyTranslateY = useSharedValue(-15);
  const inlineNavOpacity = useSharedValue(1);
  const isStickyRef = useRef(false);

  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const categoryNavRef = useRef<ScrollView>(null);

  // Check if restaurantId is a UUID (backend store) or mock store ID
  const isBackendStore = restaurantId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(restaurantId);
  
  // Get restaurant/store info
  const mockRestaurant = restaurantId && !isBackendStore ? restaurants.find((r) => r.id === restaurantId) : undefined;
  const backendStore = restaurantId && isBackendStore ? getStoreById(restaurantId) : undefined;
  
  // Use backend store if available, otherwise use mock restaurant
  const restaurant = isBackendStore && backendStore ? {
    id: backendStore.id,
    name: backendStore.name,
    cuisine: backendStore.description || 'Γρήγορο Φαγητό',
    rating: 4.5,
    deliveryTime: `${backendStore.estimatedDeliveryTime}-${backendStore.estimatedDeliveryTime + 10} λεπτά`,
    deliveryFee: Number(backendStore.deliveryFee),
    minOrder: Number(backendStore.minOrderAmount),
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    distance: '1.0 km',
    isPromoted: false,
  } : mockRestaurant;

  // Load backend products if it's a backend store
  useEffect(() => {
    if (restaurantId && isBackendStore) {
      setLoadingProducts(true);
      getStoreProducts(restaurantId)
        .then((products) => {
          // Convert backend products to MenuItem format
          const convertedProducts: MenuItem[] = products.map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description || '',
            price: Number(product.price),
            image: product.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
            category: product.category || 'Άλλα',
            isPopular: product.featured || false,
          }));
          setBackendProducts(convertedProducts);
        })
        .catch((error) => {
          console.error('Error loading products:', error);
          setBackendProducts([]);
        })
        .finally(() => {
          setLoadingProducts(false);
        });
    }
  }, [restaurantId, isBackendStore, getStoreProducts]);

  // Use backend products if available, otherwise use mock menu
  const menu = isBackendStore ? backendProducts : (restaurantId ? (menuItems[restaurantId] || []) : []);

  const popularItems = menu.filter((item) => item.isPopular);
  const categories = Array.from(new Set(menu.map((item) => item.category)));

  const headerHeight = 280; // header image
  const restaurantInfoHeight = 120; // approximate
  const popularSectionHeight = popularItems.length > 0 ? 200 : 0;
  const baseOffset = headerHeight + restaurantInfoHeight + popularSectionHeight;

  // Update absolute positions when heights change
  useEffect(() => {
    let accumulatedY = baseOffset;
    categories.forEach((category) => {
      const height = categoryHeights.current[category] || 0;
      categoryAbsolutePositions.current[category] = accumulatedY;
      accumulatedY += height;
    });
  }, [categories, baseOffset]);

  // Calculate sticky state based on scroll position - runs on UI thread for smoothness
  useDerivedValue(() => {
    const navbarHeight = 60;
    const threshold = categoryNavYPosition.value > 0 
      ? categoryNavYPosition.value 
      : baseOffset - navbarHeight;
    
    // Use a smoother transition zone (10px buffer) for seamless fade
    const transitionStart = threshold - 10;
    const transitionEnd = threshold + 5;
    const scrollProgress = scrollY.value;
    
    if (scrollProgress >= transitionStart) {
      // Calculate opacity based on scroll position within transition zone
      const progress = Math.min(1, Math.max(0, (scrollProgress - transitionStart) / (transitionEnd - transitionStart)));
      
      // Smooth crossfade: inline nav fades out, sticky nav fades in
      inlineNavOpacity.value = withSpring(1 - progress, {
        damping: 20,
        stiffness: 400,
        mass: 0.7,
      });
      stickyOpacity.value = withSpring(progress, {
        damping: 20,
        stiffness: 400,
        mass: 0.7,
      });
      stickyTranslateY.value = withSpring((1 - progress) * -15, {
        damping: 20,
        stiffness: 400,
        mass: 0.7,
      });
      
      // Update pointer events based on opacity
      const shouldBeInteractive = progress > 0.1;
      runOnJS(setStickyNavPointerEvents)(shouldBeInteractive ? 'auto' : 'none');
      
      if (progress > 0.5 && !isStickyRef.current) {
        isStickyRef.current = true;
        runOnJS(setIsNavSticky)(true);
      } else if (progress <= 0.5 && isStickyRef.current) {
        isStickyRef.current = false;
        runOnJS(setIsNavSticky)(false);
      }
    } else {
      // Before transition zone - show inline nav
      inlineNavOpacity.value = withSpring(1, {
        damping: 20,
        stiffness: 400,
        mass: 0.7,
      });
      stickyOpacity.value = withSpring(0, {
        damping: 20,
        stiffness: 400,
        mass: 0.7,
      });
      stickyTranslateY.value = withSpring(-15, {
        damping: 20,
        stiffness: 400,
        mass: 0.7,
      });
      
      // Update pointer events - should be none when not visible
      runOnJS(setStickyNavPointerEvents)('none');
      
      if (isStickyRef.current) {
        isStickyRef.current = false;
        runOnJS(setIsNavSticky)(false);
      }
    }
  });

  // Animated styles for sticky navbar
  const stickyNavAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: stickyOpacity.value,
      transform: [{ translateY: stickyTranslateY.value }],
    };
  });

  // Animated styles for inline navbar (inside ScrollView)
  const inlineNavAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: inlineNavOpacity.value,
      pointerEvents: inlineNavOpacity.value > 0.1 ? 'auto' : 'none',
    };
  });

  // Animated padding for ScrollView when sticky
  const scrollViewPaddingStyle = useAnimatedStyle(() => {
    const paddingTop = stickyOpacity.value > 0.5 ? insets.top + 60 : 0;
    return {
      paddingTop: withSpring(paddingTop, {
        damping: 25,
        stiffness: 300,
        mass: 0.8,
      }),
    };
  });

  // Handle scroll to detect active category and sticky nav
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isScrolling) return;

    const currentScrollY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;
    scrollY.value = currentScrollY;

    const navBarHeight = 60;
    const threshold = currentScrollY + navBarHeight + 100;
    
    // Find which category section is currently visible
    let foundCategory = '';
    let minDistance = Infinity;
    
    // First, try to find category based on scroll position
    categories.forEach((category, index) => {
      const absolutePosition = categoryAbsolutePositions.current[category];
      const height = categoryHeights.current[category] || 0;
      
      if (absolutePosition !== undefined) {
        const sectionTop = absolutePosition;
        const sectionBottom = absolutePosition + height;
        const isLastCategory = index === categories.length - 1;
        
        // For regular categories, use standard detection
        if (!isLastCategory) {
          const distance = Math.abs(threshold - sectionTop);
          
          // Check if threshold is within this section
          if (threshold >= sectionTop - 50 && threshold < sectionBottom) {
            if (distance < minDistance) {
              minDistance = distance;
              foundCategory = category;
            }
          }
        } else {
          // For the last category, use smarter detection
          // Only select it if we're actually within its bounds OR very close to bottom
          const isVeryNearBottom = currentScrollY + layoutHeight >= contentHeight - 100;
          const isWithinLastCategory = threshold >= sectionTop - 50 && threshold <= sectionBottom + 100;
          
          if (isWithinLastCategory || isVeryNearBottom) {
            const distance = Math.abs(threshold - sectionTop);
            if (distance < minDistance) {
              minDistance = distance;
              foundCategory = category;
            }
          }
        }
      }
    });

    if (foundCategory && foundCategory !== activeCategory) {
      setActiveCategory(foundCategory);
      scrollCategoryNav(foundCategory);
    }
  };

  const scrollToCategory = (category: string) => {
    setIsScrolling(true);
    const absolutePosition = categoryAbsolutePositions.current[category];
    
    if (absolutePosition !== undefined && scrollViewRef.current) {
      const targetY = Math.max(0, absolutePosition - 100); // 100px offset for nav bar
      
      scrollViewRef.current.scrollTo({
        y: targetY,
        animated: true,
      });
      
      // Update scrollY.value immediately so sticky navbar reacts correctly
      scrollY.value = targetY;
      
      setActiveCategory(category);
      scrollCategoryNav(category);
      
      // Wait for scroll animation to complete before allowing scroll detection again
      setTimeout(() => {
        setIsScrolling(false);
      }, 500);
    }
  };

  // Handle scroll end to ensure sticky navbar updates correctly after programmatic scroll
  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    scrollY.value = currentScrollY;
  };

  const scrollCategoryNav = (category: string) => {
    const categoryIndex = categories.indexOf(category);
    if (categoryIndex >= 0 && categoryNavRef.current) {
      const buttonWidth = 120;
      const scrollX = categoryIndex * buttonWidth - width / 2 + buttonWidth / 2;
      categoryNavRef.current.scrollTo({
        x: Math.max(0, scrollX),
        animated: true,
      });
    }
  };

  // Set initial active category
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories]);

  // Confirmation dialog όταν προσπαθεί να βγει με προϊόντα
  // Αλλά όχι όταν πηγαίνει στο Checkout ή OrderStatus
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      const action = e.data.action;
      
      // Allow navigation to Checkout or OrderStatus screens
      if (
        action.type === 'RESET' ||
        (action.type === 'NAVIGATE' && 
         (action.payload?.name === 'Checkout' || action.payload?.name === 'OrderStatus'))
      ) {
        // Allow navigation to proceed
        return;
      }
      
      // Only show alert if trying to go back with items in cart
      if (cartItems.length > 0) {
        e.preventDefault();
        Alert.alert(
          'Επιβεβαίωση',
          'Έχετε προϊόντα στο καλάθι. Είστε σίγουροι ότι θέλετε να βγείτε;',
          [
            {
              text: 'Ακύρωση',
              style: 'cancel',
            },
            {
              text: 'Ναι, βγες',
              style: 'destructive',
              onPress: () => navigation.dispatch(e.data.action),
            },
          ]
        );
      }
    });

    return unsubscribe;
  }, [navigation, cartItems.length]);

  // Early return after all hooks - check for missing restaurantId or restaurant not found
  if (!restaurantId) {
    return (
      <View style={styles.container}>
        <Text>Restaurant ID not provided</Text>
      </View>
    );
  }

  if (isBackendStore && loadingProducts) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Φόρτωση προϊόντων...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Το εστιατόριο δεν βρέθηκε</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Sticky Category Navigation Bar */}
      {categories.length > 0 && (
        <Animated.View 
          style={[
            styles.categoryNavContainerSticky, 
            { paddingTop: insets.top + 12 },
            stickyNavAnimatedStyle,
          ]}
          pointerEvents={stickyNavPointerEvents}
        >
          <ScrollView
            ref={categoryNavRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryNavContent}
          >
            {categories.map((category) => {
              const isActive = activeCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryNavButton, isActive && styles.categoryNavButtonActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    scrollToCategory(category);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.categoryNavText, isActive && styles.categoryNavTextActive]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>
      )}

      <Animated.ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        scrollEventThrottle={16}
        removeClippedSubviews={false}
        contentContainerStyle={[scrollViewPaddingStyle]}
      >
        {/* Header Image */}
        <View style={styles.headerImageContainer}>
          <Image source={{ uri: restaurant.image }} style={styles.headerImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.headerGradient}
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (cartItems.length > 0) {
                Alert.alert(
                  'Επιβεβαίωση',
                  'Έχετε προϊόντα στο καλάθι. Είστε σίγουροι ότι θέλετε να βγείτε;',
                  [
                    {
                      text: 'Ακύρωση',
                      style: 'cancel',
                    },
                    {
                      text: 'Ναι, βγες',
                      style: 'destructive',
                      onPress: () => navigation.goBack(),
                    },
                  ]
                );
              } else {
                navigation.goBack();
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Restaurant Info */}
        <View style={styles.restaurantInfo}>
          <View style={styles.restaurantHeader}>
            <View>
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
              <Text style={styles.restaurantCuisine}>{restaurant.cuisine}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={16} color="#92400E" />
              <Text style={styles.ratingText}> {restaurant.rating}</Text>
            </View>
          </View>
          <View style={styles.restaurantDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={18} color="#374151" />
              <Text style={styles.detailText}>{restaurant.deliveryTime}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={18} color="#374151" />
              <Text style={styles.detailText}>{restaurant.distance}</Text>
            </View>
            <View style={styles.detailItem}>
              {restaurant.deliveryFee === 0 ? (
                <Ionicons name="gift-outline" size={18} color="#374151" />
              ) : (
                <Ionicons name="cash-outline" size={18} color="#374151" />
              )}
              <Text style={styles.detailText}>
                {restaurant.deliveryFee === 0 ? 'Δωρεάν' : `€${restaurant.deliveryFee.toFixed(2)}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Category Navigation Bar (inside ScrollView) */}
        {categories.length > 0 && (
          <Animated.View 
            ref={categoryNavRefForLayout}
            style={[styles.categoryNavContainer, inlineNavAnimatedStyle]}
            onLayout={(event) => {
              // y is relative to the ScrollView content
              categoryNavYPosition.value = event.nativeEvent.layout.y;
            }}
          >
            <ScrollView
              ref={categoryNavRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryNavContent}
            >
              {categories.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <TouchableOpacity
                    key={category}
                    style={[styles.categoryNavButton, isActive && styles.categoryNavButtonActive]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      scrollToCategory(category);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.categoryNavText, isActive && styles.categoryNavTextActive]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>
        )}

        {/* Popular Items */}
        {popularItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="flame" size={20} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Δημοφιλή</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.popularScroll}>
              {popularItems.map((item, index) => (
                <Animated.View
                  key={item.id}
                  entering={FadeInRight.delay(index * 100).springify()}
                >
                  <TouchableOpacity
                    style={styles.popularCard}
                    onPress={() => {
                      if ((item.extras && item.extras.length > 0) || (item.radioOptions && item.radioOptions.options.length > 0)) {
                        setSelectedItem(item);
                        setProductModalVisible(true);
                      } else {
                        addToCart(item, restaurantId);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                  <Image source={{ uri: item.image }} style={styles.popularImage} />
                  <View style={styles.popularInfo}>
                    <Text style={styles.popularName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.popularPrice}>€{item.price.toFixed(2)}</Text>
                  </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Menu Items by Category */}
        {categories.map((category) => {
          const categoryItems = menu.filter((item) => item.category === category);
          return (
            <View
              key={category}
              ref={(ref) => {
                categoryRefs.current[category] = ref;
              }}
              onLayout={(event) => {
                const { height } = event.nativeEvent.layout;
                categoryHeights.current[category] = height;
                // Recalculate absolute positions
                let accumulatedY = baseOffset;
                categories.forEach((cat) => {
                  categoryAbsolutePositions.current[cat] = accumulatedY;
                  accumulatedY += categoryHeights.current[cat] || 0;
                });
              }}
              style={styles.section}
            >
              <View style={styles.categoryTitleContainer}>
                <Text style={styles.categoryTitle}>{category}</Text>
              </View>
              {categoryItems.map((item, index) => (
                <Animated.View
                  key={item.id}
                  entering={FadeInDown.delay(index * 50).springify()}
                >
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      if ((item.extras && item.extras.length > 0) || (item.radioOptions && item.radioOptions.options.length > 0)) {
                        setSelectedItem(item);
                        setProductModalVisible(true);
                      } else {
                        addToCart(item, restaurantId);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                  <Image source={{ uri: item.image }} style={styles.menuItemImage} />
                  <View style={styles.menuItemInfo}>
                    <View style={styles.menuItemHeader}>
                      <Text style={styles.menuItemName}>{item.name}</Text>
                      {item.isPopular && (
                        <View style={styles.popularBadge}>
                          <Ionicons name="flame" size={16} color="#FF6B35" />
                        </View>
                      )}
                    </View>
                    <Text style={styles.menuItemDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                    <View style={styles.menuItemFooter}>
                      <Text style={styles.menuItemPrice}>€{item.price.toFixed(2)}</Text>
                    </View>
                  </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          );
        })}
      </Animated.ScrollView>

      {/* Floating Cart Button */}
      {getTotalItems() > 0 && (
        <Animated.View 
          entering={FadeInUp.springify()}
          style={styles.floatingCartButton}
        >
          <TouchableOpacity
            style={styles.floatingCartButtonInner}
            onPress={() => setCartModalVisible(true)}
            activeOpacity={0.9}
          >
            <View style={styles.floatingCartContent}>
              <View style={styles.floatingCartLeft}>
                <View style={styles.floatingCartBadge}>
                  <Text style={styles.floatingCartBadgeText}>{getTotalItems()}</Text>
                </View>
                <Text style={styles.floatingCartText}>Προβολή Καλαθιού</Text>
              </View>
              <Text style={styles.floatingCartPrice}>€{cartItems.reduce((sum, item) => sum + (item.totalPrice || item.price) * item.quantity, 0).toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Cart Modal */}
      <CartModal
        visible={cartModalVisible}
        onClose={() => setCartModalVisible(false)}
      />

      {/* Product Modal */}
      <ProductModal
        visible={productModalVisible}
        item={selectedItem}
        onClose={() => {
          setProductModalVisible(false);
          setSelectedItem(null);
        }}
        onAddToCart={(item, selectedExtras, totalPrice, selectedRadioOption) => {
          addToCart(item, restaurantId, selectedExtras, totalPrice, selectedRadioOption);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  categoryNavContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  categoryNavContainerSticky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingTop: 12,
    paddingBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 100,
  },
  categoryNavContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryNavButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  categoryNavButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
    elevation: 2,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  categoryNavText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryNavTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerImageContainer: {
    width: '100%',
    height: 280,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  backButtonText: {
    fontSize: 26,
    color: '#111827',
    fontWeight: '600',
  },
  cartButton: {
    position: 'absolute',
    top: 50,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
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
  restaurantInfo: {
    backgroundColor: '#FFFFFF',
    padding: 28,
    borderBottomWidth: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  restaurantName: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  restaurantCuisine: {
    fontSize: 17,
    color: '#6B7280',
    marginTop: 8,
    fontWeight: '500',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#FCD34D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    gap: 5,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
  },
  restaurantDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
  },
  section: {
    marginTop: 32,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  categoryTitleContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  popularScroll: {
    paddingLeft: 24,
    paddingRight: 8,
  },
  popularCard: {
    width: 180,
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  popularImage: {
    width: '100%',
    height: 130,
  },
  popularInfo: {
    padding: 14,
  },
  popularName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  popularPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B35',
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginBottom: 14,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'stretch',
  },
  menuItemImage: {
    width: 90,
    height: '100%',
  },
  menuItemInfo: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  menuItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  menuItemName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    letterSpacing: -0.2,
  },
  popularBadge: {
    marginLeft: 8,
  },
  menuItemDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 3,
    marginBottom: 6,
    lineHeight: 18,
    fontWeight: '500',
  },
  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B35',
  },
  floatingCartButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
  },
  floatingCartButtonInner: {
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 24,
    elevation: 12,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  floatingCartContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  floatingCartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  floatingCartBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingCartBadgeText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  floatingCartText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  floatingCartPrice: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

