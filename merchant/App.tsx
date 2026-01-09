import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import DashboardScreen from './src/screens/DashboardScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import PromotionsScreen from './src/screens/PromotionsScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { OrdersProvider, useOrders } from './src/context/OrdersContext';
import { ProductsProvider, useProducts } from './src/context/ProductsContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Auth Stack (Login/Register)
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Component to initialize storeId from merchant's stores
function StoreIdInitializer() {
  const { setStoreId: setOrdersStoreId } = useOrders();
  const { setStoreId: setProductsStoreId } = useProducts();
  const { user, isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'merchant') {
      // Clear storeId if not authenticated or not a merchant
      setOrdersStoreId(undefined);
      setProductsStoreId(undefined);
      return;
    }

    // Fetch merchant's stores and use the first one
    // TODO: In production, merchant might have multiple stores - handle selection
    const fetchStoreId = async () => {
      try {
        const { storesService } = await import('./src/services/storesService');
        const stores = await storesService.getByMerchant(user.id);
        if (stores.length > 0) {
          const storeId = stores[0].id;
          console.log('✅ Store ID set:', storeId);
          setOrdersStoreId(storeId);
          setProductsStoreId(storeId);
        } else {
          console.warn('⚠️ No stores found for merchant. Creating default store...');
          // Create a default store for the merchant
          try {
            const defaultStore = await storesService.create({
              merchantId: user.id,
              name: 'Το Μαγαζί μου',
              description: 'Προσθέστε περιγραφή για το μαγαζί σας',
              minOrderAmount: 10,
              deliveryFee: 2.5,
              estimatedDeliveryTime: 30,
              acceptsCash: true,
              acceptsCard: true,
              acceptsDigital: true,
            });
            
            if (defaultStore) {
              console.log('✅ Default store created:', defaultStore.id);
              setOrdersStoreId(defaultStore.id);
              setProductsStoreId(defaultStore.id);
            } else {
              console.error('Failed to create default store');
              setOrdersStoreId(undefined);
              setProductsStoreId(undefined);
            }
          } catch (createError) {
            console.error('Error creating default store:', createError);
            setOrdersStoreId(undefined);
            setProductsStoreId(undefined);
          }
        }
      } catch (error) {
        console.error('Error fetching merchant stores:', error);
        // Don't set mock storeId on error - show error to user
        setOrdersStoreId(undefined);
        setProductsStoreId(undefined);
      }
    };

    fetchStoreId();
  }, [user, isAuthenticated, setOrdersStoreId, setProductsStoreId]);

  return null;
}

// Root Navigator - switches between Auth and Main based on auth state
function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Φόρτωση...</Text>
      </View>
    );
  }

  return isAuthenticated ? (
    <>
      <StoreIdInitializer />
      <MainTabs />
    </>
  ) : (
    <AuthStack />
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Promotions" component={PromotionsScreen} />
    </Stack.Navigator>
  );
}

// Main Tabs (Dashboard, Orders, Products, Profile)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: any) => ({
        tabBarIcon: ({ focused, color, size }: any) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Products') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Αρχική' }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ tabBarLabel: 'Παραγγελίες' }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{ tabBarLabel: 'Προϊόντα' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ tabBarLabel: 'Προφίλ' }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  try {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <AuthProvider>
            <ProductsProvider>
              <OrdersProvider>
                <StatusBar style="dark" />
                <RootNavigator />
                <Toast />
              </OrdersProvider>
            </ProductsProvider>
          </AuthProvider>
        </NavigationContainer>
      </GestureHandlerRootView>
    );
  } catch (error) {
    console.error('App error:', error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Σφάλμα!</Text>
        <Text style={styles.errorDetails}>{String(error)}</Text>
      </View>
    );
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Σφάλμα!</Text>
          <Text style={styles.errorDetails}>{this.state.error?.message}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 10,
  },
  errorDetails: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 12,
  },
});
