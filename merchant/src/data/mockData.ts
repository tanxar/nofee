export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentMethod = 'card' | 'cash' | 'digital';
export type DeliveryType = 'delivery' | 'pickup';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  deliveryType: DeliveryType;
  createdAt: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  deliveryAddress?: string;
  notes?: string;
  rating?: number;
  review?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  preparationTime?: number; // in minutes
  featured: boolean;
  stock?: number;
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  order: number;
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'buy_x_get_y';
  value: number;
  startDate: string;
  endDate: string;
  active: boolean;
  minOrderAmount?: number;
  applicableProducts?: string[];
}

export interface Notification {
  id: string;
  type: 'order' | 'system' | 'promotion';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  orderId?: string;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface MerchantStats {
  todayRevenue: number;
  todayOrders: number;
  pendingOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  completionRate: number;
  weeklyRevenue: number;
  weeklyOrders: number;
  monthlyRevenue: number;
  monthlyOrders: number;
}

export interface StoreSettings {
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  openingHours: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };
  deliveryZones: {
    name: string;
    radius: number; // in km
    deliveryFee: number;
  }[];
  minOrderAmount: number;
  estimatedDeliveryTime: number; // in minutes
  acceptsCash: boolean;
  acceptsCard: boolean;
  acceptsDigital: boolean;
}

// Mock Orders - Extended
export const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: '#ORD-2024-001',
    customerName: 'Γιάννης Παπαδόπουλος',
    customerPhone: '6941234567',
    customerEmail: 'giannis@example.com',
    items: [
      { id: '1', productId: '1', productName: 'Μπέργκερ Κλασικό', quantity: 2, price: 12.50 },
      { id: '2', productId: '2', productName: 'Ποτό Cola', quantity: 2, price: 3.00 },
    ],
    subtotal: 31.00,
    deliveryFee: 2.50,
    discount: 0,
    total: 33.50,
    status: 'pending',
    paymentMethod: 'card',
    deliveryType: 'delivery',
    createdAt: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 30 * 60000).toISOString(),
    deliveryAddress: 'Πανεπιστημίου 123, Αθήνα',
    notes: 'Χωρίς κρεμμύδι',
  },
  {
    id: '2',
    orderNumber: '#ORD-2024-002',
    customerName: 'Μαρία Γεωργίου',
    customerPhone: '6947654321',
    items: [
      { id: '3', productId: '3', productName: 'Πίτσα Μαργαρίτα', quantity: 1, price: 15.00 },
      { id: '4', productId: '4', productName: 'Σαλάτα Καίσαρας', quantity: 1, price: 8.50 },
    ],
    subtotal: 23.50,
    deliveryFee: 2.50,
    discount: 2.00,
    total: 24.00,
    status: 'preparing',
    paymentMethod: 'cash',
    deliveryType: 'delivery',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 15 * 60000).toISOString(),
    deliveryAddress: 'Σόλωνος 45, Αθήνα',
  },
  {
    id: '3',
    orderNumber: '#ORD-2024-003',
    customerName: 'Νίκος Δημητρίου',
    customerPhone: '6949876543',
    items: [
      { id: '5', productId: '5', productName: 'Σουβλάκι', quantity: 3, price: 4.50 },
    ],
    subtotal: 13.50,
    deliveryFee: 0,
    discount: 0,
    total: 13.50,
    status: 'ready',
    paymentMethod: 'digital',
    deliveryType: 'pickup',
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 5 * 60000).toISOString(),
  },
  {
    id: '4',
    orderNumber: '#ORD-2024-004',
    customerName: 'Ελένη Κωνσταντίνου',
    customerPhone: '6941112233',
    items: [
      { id: '6', productId: '6', productName: 'Παστίτσιο', quantity: 2, price: 10.00 },
      { id: '7', productId: '7', productName: 'Σαλάτα', quantity: 1, price: 6.00 },
    ],
    subtotal: 26.00,
    deliveryFee: 2.50,
    discount: 0,
    total: 28.50,
    status: 'completed',
    paymentMethod: 'card',
    deliveryType: 'delivery',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    deliveredAt: new Date(Date.now() - 1.5 * 3600000).toISOString(),
    deliveryAddress: 'Ακαδημίας 12, Αθήνα',
    rating: 5,
    review: 'Πολύ καλό!',
  },
  {
    id: '5',
    orderNumber: '#ORD-2024-005',
    customerName: 'Δημήτρης Αντωνίου',
    customerPhone: '6942223344',
    items: [
      { id: '1', productId: '1', productName: 'Μπέργκερ Κλασικό', quantity: 1, price: 12.50 },
      { id: '3', productId: '3', productName: 'Πίτσα Μαργαρίτα', quantity: 1, price: 15.00 },
    ],
    subtotal: 27.50,
    deliveryFee: 2.50,
    discount: 5.00,
    total: 25.00,
    status: 'pending',
    paymentMethod: 'digital',
    deliveryType: 'delivery',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 25 * 60000).toISOString(),
    deliveryAddress: 'Λεωφόρος Κηφισίας 100, Αθήνα',
  },
];

// Mock Products - Extended
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Μπέργκερ Κλασικό',
    description: 'Μπέργκερ με μοσχάρι, τυρί, μαρούλι, ντομάτα, σως',
    price: 12.50,
    category: 'Μπέργκερ',
    available: true,
    preparationTime: 15,
    featured: true,
    stock: 50,
    tags: ['popular', 'meat'],
  },
  {
    id: '2',
    name: 'Ποτό Cola',
    description: 'Κρύο αναψυκτικό 330ml',
    price: 3.00,
    category: 'Ποτά',
    available: true,
    featured: false,
    stock: 200,
    tags: ['drink'],
  },
  {
    id: '3',
    name: 'Πίτσα Μαργαρίτα',
    description: 'Πίτσα με ντομάτα, μοτσαρέλα, ρίγανη, ελαιόλαδο',
    price: 15.00,
    category: 'Πίτσα',
    available: true,
    preparationTime: 20,
    featured: true,
    stock: 30,
    tags: ['popular', 'vegetarian'],
  },
  {
    id: '4',
    name: 'Σαλάτα Καίσαρας',
    description: 'Σαλάτα με κοτόπουλο, μπέικον, croutons, parmesan',
    price: 8.50,
    category: 'Σαλάτες',
    available: true,
    preparationTime: 10,
    featured: false,
    stock: 25,
    tags: ['salad', 'chicken'],
  },
  {
    id: '5',
    name: 'Σουβλάκι',
    description: 'Σουβλάκι χοιρινό με πίτα, ντομάτα, κρεμμύδι, τζατζίκι',
    price: 4.50,
    category: 'Σουβλάκια',
    available: true,
    preparationTime: 12,
    featured: true,
    stock: 100,
    tags: ['popular', 'meat', 'greek'],
  },
  {
    id: '6',
    name: 'Παστίτσιο',
    description: 'Παστίτσιο με μπέσαμελ, μοσχάρι, μακαρόνια',
    price: 10.00,
    category: 'Πιάτα',
    available: true,
    preparationTime: 25,
    featured: false,
    stock: 20,
    tags: ['pasta', 'meat'],
  },
  {
    id: '7',
    name: 'Σαλάτα',
    description: 'Φρέσκια σαλάτα με ελαιόλαδο, ξύδι, αλάτι',
    price: 6.00,
    category: 'Σαλάτες',
    available: true,
    preparationTime: 5,
    featured: false,
    stock: 40,
    tags: ['salad', 'vegetarian'],
  },
  {
    id: '8',
    name: 'Μπέργκερ BBQ',
    description: 'Μπέργκερ με μοσχάρι, τυρί, μπέικον, BBQ σως',
    price: 14.50,
    category: 'Μπέργκερ',
    available: true,
    preparationTime: 15,
    featured: true,
    stock: 35,
    tags: ['popular', 'meat'],
  },
];

// Mock Categories
export const mockCategories: Category[] = [
  { id: '1', name: 'Μπέργκερ', icon: 'fast-food', order: 1 },
  { id: '2', name: 'Πίτσα', icon: 'pizza', order: 2 },
  { id: '3', name: 'Σουβλάκια', icon: 'restaurant', order: 3 },
  { id: '4', name: 'Σαλάτες', icon: 'leaf', order: 4 },
  { id: '5', name: 'Πιάτα', icon: 'restaurant-outline', order: 5 },
  { id: '6', name: 'Ποτά', icon: 'beer', order: 6 },
];

// Mock Promotions
export const mockPromotions: Promotion[] = [
  {
    id: '1',
    name: 'Εβδομαδιαία Προσφορά',
    description: '20% έκπτωση σε όλες τις πίτσες',
    type: 'percentage',
    value: 20,
    startDate: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
    active: true,
    applicableProducts: ['3'],
  },
  {
    id: '2',
    name: 'Δωρεάν Παράδοση',
    description: 'Δωρεάν παράδοση για παραγγελίες άνω των €20',
    type: 'fixed',
    value: 2.50,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 3600000).toISOString(),
    active: true,
    minOrderAmount: 20,
  },
  {
    id: '3',
    name: '3+1 Δωρεάν',
    description: 'Αγόρασε 3 σουβλάκια και πάρε 1 δωρεάν',
    type: 'buy_x_get_y',
    value: 1,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 14 * 24 * 3600000).toISOString(),
    active: true,
    applicableProducts: ['5'],
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Νέα Παραγγελία',
    message: 'Νέα παραγγελία #ORD-2024-001 από Γιάννης Παπαδόπουλος',
    read: false,
    createdAt: new Date().toISOString(),
    orderId: '1',
  },
  {
    id: '2',
    type: 'system',
    title: 'Ενημέρωση Συστήματος',
    message: 'Νέα έκδοση της εφαρμογής διαθέσιμη',
    read: false,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: '3',
    type: 'promotion',
    title: 'Νέα Προσφορά',
    message: 'Η προσφορά "Εβδομαδιαία Προσφορά" είναι ενεργή',
    read: true,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

// Mock Revenue Data (last 7 days)
export const mockRevenueData: RevenueData[] = [
  { date: '2024-01-01', revenue: 450.50, orders: 18 },
  { date: '2024-01-02', revenue: 520.75, orders: 22 },
  { date: '2024-01-03', revenue: 380.25, orders: 15 },
  { date: '2024-01-04', revenue: 610.00, orders: 25 },
  { date: '2024-01-05', revenue: 490.50, orders: 20 },
  { date: '2024-01-06', revenue: 550.75, orders: 23 },
  { date: '2024-01-07', revenue: 234.50, orders: 12 },
];

// Enhanced Mock Stats
export const mockStats: MerchantStats = {
  todayRevenue: 234.50,
  todayOrders: 12,
  pendingOrders: 3,
  totalProducts: 8,
  averageOrderValue: 19.54,
  completionRate: 95.5,
  weeklyRevenue: 3236.25,
  weeklyOrders: 135,
  monthlyRevenue: 12500.00,
  monthlyOrders: 520,
};

// Mock Store Settings
export const mockStoreSettings: StoreSettings = {
  name: 'Το Μαγαζί μας',
  description: 'Φρέσκο φαγητό με αγάπη',
  phone: '2101234567',
  email: 'info@magazi.gr',
  address: 'Πανεπιστημίου 50, Αθήνα 10679',
  openingHours: {
    monday: { open: '10:00', close: '22:00' },
    tuesday: { open: '10:00', close: '22:00' },
    wednesday: { open: '10:00', close: '22:00' },
    thursday: { open: '10:00', close: '22:00' },
    friday: { open: '10:00', close: '23:00' },
    saturday: { open: '11:00', close: '23:00' },
    sunday: { open: '12:00', close: '21:00', closed: false },
  },
  deliveryZones: [
    { name: 'Κέντρο', radius: 5, deliveryFee: 2.50 },
    { name: 'Βόρεια Προάστια', radius: 10, deliveryFee: 4.00 },
    { name: 'Νότια Προάστια', radius: 10, deliveryFee: 4.00 },
  ],
  minOrderAmount: 10.00,
  estimatedDeliveryTime: 30,
  acceptsCash: true,
  acceptsCard: true,
  acceptsDigital: true,
};
