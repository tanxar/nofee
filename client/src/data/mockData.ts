export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  image: string;
  distance: string;
  isPromoted: boolean;
}

export interface MenuItemExtra {
  id: string;
  name: string;
  price: number;
}

export interface MenuItemRadioOption {
  id: string;
  name: string;
  price?: number; // Optional - αν δεν έχει price, δεν αλλάζει την τιμή
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isPopular?: boolean;
  extras?: MenuItemExtra[];
  radioOptions?: {
    title: string;
    options: MenuItemRadioOption[];
  };
}

export const categories = [
  { id: '1', name: 'Όλα', icon: 'restaurant-outline' },
  { id: '2', name: 'Πιτσες', icon: 'pizza-outline' },
  { id: '3', name: 'Burger', icon: 'fast-food-outline' },
  { id: '4', name: 'Σούσι', icon: 'fish-outline' },
  { id: '5', name: 'Ελληνική', icon: 'wine-outline' },
  { id: '6', name: 'Ασιατική', icon: 'restaurant-outline' },
  { id: '7', name: 'Γλυκό', icon: 'ice-cream-outline' },
  { id: '8', name: 'Σαλάτες', icon: 'leaf-outline' },
  { id: '9', name: 'Πάστα', icon: 'restaurant-outline' },
  { id: '10', name: 'Καφέδες', icon: 'cafe-outline' },
  { id: '11', name: 'Ποτά', icon: 'wine-outline' },
];

export const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Pizza Express',
    cuisine: 'Ιταλική',
    rating: 4.8,
    deliveryTime: '25-35 λεπτά',
    deliveryFee: 2.50,
    minOrder: 15,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    distance: '1.2 km',
    isPromoted: true,
  },
  {
    id: '2',
    name: 'Burger House',
    cuisine: 'Αμερικανική',
    rating: 4.6,
    deliveryTime: '20-30 λεπτά',
    deliveryFee: 1.90,
    minOrder: 12,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    distance: '0.8 km',
    isPromoted: false,
  },
  {
    id: '3',
    name: 'Sushi Master',
    cuisine: 'Ιαπωνική',
    rating: 4.9,
    deliveryTime: '30-40 λεπτά',
    deliveryFee: 3.00,
    minOrder: 20,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
    distance: '2.1 km',
    isPromoted: true,
  },
  {
    id: '4',
    name: 'Το Καλύτερο',
    cuisine: 'Ελληνική',
    rating: 4.7,
    deliveryTime: '25-35 λεπτά',
    deliveryFee: 2.00,
    minOrder: 10,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
    distance: '1.5 km',
    isPromoted: false,
  },
  {
    id: '5',
    name: 'Noodle Bar',
    cuisine: 'Ασιατική',
    rating: 4.5,
    deliveryTime: '20-30 λεπτά',
    deliveryFee: 2.20,
    minOrder: 14,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
    distance: '1.8 km',
    isPromoted: false,
  },
  {
    id: '6',
    name: 'Sweet Dreams',
    cuisine: 'Γλυκό',
    rating: 4.8,
    deliveryTime: '15-25 λεπτά',
    deliveryFee: 1.50,
    minOrder: 8,
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
    distance: '0.9 km',
    isPromoted: true,
  },
];

export const menuItems: { [restaurantId: string]: MenuItem[] } = {
  '1': [
    {
      id: 'p1',
      name: 'Margherita',
      description: 'Ντομάτα, μοτσαρέλα, βασιλικός',
      price: 8.50,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300',
      category: 'Πιτσες',
      isPopular: true,
      extras: [
        { id: 'e1', name: 'Επιπλέον μοτσαρέλα', price: 1.50 },
        { id: 'e2', name: 'Επιπλέον pepperoni', price: 2.00 },
        { id: 'e3', name: 'Επιπλέον μανιτάρια', price: 1.00 },
        { id: 'e4', name: 'Επιπλέον ζαμπόν', price: 2.00 },
      ],
    },
    {
      id: 'p2',
      name: 'Pepperoni',
      description: 'Ντομάτα, μοτσαρέλα, pepperoni',
      price: 10.50,
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300',
      category: 'Πιτσες',
      isPopular: true,
    },
    {
      id: 'p3',
      name: 'Quattro Stagioni',
      description: 'Ντομάτα, μοτσαρέλα, μανιτάρια, ζαμπόν, αρτισόκια',
      price: 12.00,
      image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=300',
      category: 'Πιτσες',
    },
    {
      id: 'p4',
      name: 'Hawaiian',
      description: 'Ντομάτα, μοτσαρέλα, ζαμπόν, ανανάς',
      price: 11.00,
      image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300',
      category: 'Πιτσες',
    },
    {
      id: 'p5',
      name: 'Capricciosa',
      description: 'Ντομάτα, μοτσαρέλα, ζαμπόν, μανιτάρια, αρτισόκια',
      price: 12.50,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300',
      category: 'Πιτσες',
      isPopular: true,
    },
    {
      id: 'p6',
      name: 'Diavola',
      description: 'Ντομάτα, μοτσαρέλα, σαλάμι, καυτερή πιπεριά',
      price: 11.50,
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300',
      category: 'Πιτσες',
    },
    {
      id: 'p7',
      name: 'Quattro Formaggi',
      description: 'Μοτσαρέλα, γκοργκόνζολα, παρμεζάνα, ριγκότα',
      price: 13.00,
      image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=300',
      category: 'Πιτσες',
    },
    {
      id: 'sal1',
      name: 'Caesar Salad',
      description: 'Μαρούλι, παράνο, παρμεζάνα, σως caesar',
      price: 8.50,
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300',
      category: 'Σαλάτες',
      extras: [
        { id: 'e9', name: 'Επιπλέον κοτόπουλο', price: 3.00 },
        { id: 'e10', name: 'Επιπλέον παρμεζάνα', price: 1.50 },
      ],
    },
    {
      id: 'sal2',
      name: 'Greek Salad',
      description: 'Ντομάτα, αγγούρι, φέτα, ελιές, ελαιόλαδο',
      price: 7.50,
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300',
      category: 'Σαλάτες',
      isPopular: true,
    },
    {
      id: 'pas1',
      name: 'Carbonara',
      description: 'Πάστα, μπέικον, αυγό, παρμεζάνα',
      price: 10.50,
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=300',
      category: 'Πάστα',
      isPopular: true,
    },
    {
      id: 'pas2',
      name: 'Bolognese',
      description: 'Πάστα, κιμάς, ντομάτα, παρμεζάνα',
      price: 11.00,
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=300',
      category: 'Πάστα',
    },
  ],
  '2': [
    {
      id: 'b1',
      name: 'Classic Burger',
      description: 'Μπιφτέκι, μαρούλι, ντομάτα, κρεμμύδι, σως',
      price: 7.50,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300',
      category: 'Burger',
      isPopular: true,
      extras: [
        { id: 'e5', name: 'Επιπλέον τυρί', price: 1.00 },
        { id: 'e6', name: 'Επιπλέον μπέικον', price: 1.50 },
        { id: 'e7', name: 'Επιπλέον αυγό', price: 0.50 },
        { id: 'e8', name: 'Επιπλέον πατάτες', price: 2.00 },
      ],
    },
    {
      id: 'b2',
      name: 'Cheese Burger',
      description: 'Μπιφτέκι, τυρί, μαρούλι, ντομάτα, σως',
      price: 8.50,
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300',
      category: 'Burger',
      isPopular: true,
    },
    {
      id: 'b3',
      name: 'Bacon Burger',
      description: 'Μπιφτέκι, μπέικον, τυρί, μαρούλι, ντομάτα',
      price: 9.50,
      image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433f?w=300',
      category: 'Burger',
    },
    {
      id: 'b4',
      name: 'Double Cheese Burger',
      description: 'Διπλό μπιφτέκι, διπλό τυρί, μαρούλι, ντομάτα, σως',
      price: 11.50,
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300',
      category: 'Burger',
      isPopular: true,
    },
    {
      id: 'b5',
      name: 'Chicken Burger',
      description: 'Κοτόπουλο, μαρούλι, ντομάτα, σως',
      price: 8.00,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300',
      category: 'Burger',
    },
    {
      id: 'b6',
      name: 'Veggie Burger',
      description: 'Χορτοφαγικό μπιφτέκι, μαρούλι, ντομάτα, σως',
      price: 7.00,
      image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433f?w=300',
      category: 'Burger',
    },
    {
      id: 'sal3',
      name: 'Chicken Salad',
      description: 'Μαρούλι, κοτόπουλο, ντομάτα, αγγούρι, σως',
      price: 9.00,
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300',
      category: 'Σαλάτες',
    },
  ],
  '3': [
    {
      id: 's1',
      name: 'Salmon Sushi Set',
      description: '8 κομμάτια σούσι με σολομό',
      price: 15.00,
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300',
      category: 'Σούσι',
      isPopular: true,
    },
    {
      id: 's2',
      name: 'Tuna Roll',
      description: '8 κομμάτια ρολό με τόνο',
      price: 12.00,
      image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=300',
      category: 'Σούσι',
    },
    {
      id: 's3',
      name: 'California Roll',
      description: '8 κομμάτια με καβουράκι και αβοκάντο',
      price: 10.00,
      image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=300',
      category: 'Σούσι',
      isPopular: true,
    },
    {
      id: 's4',
      name: 'Dragon Roll',
      description: '8 κομμάτια με γαρίδα και αβοκάντο',
      price: 14.00,
      image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=300',
      category: 'Σούσι',
      isPopular: true,
    },
    {
      id: 's5',
      name: 'Spicy Tuna Roll',
      description: '8 κομμάτια με καυτερό τόνο',
      price: 13.00,
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300',
      category: 'Σούσι',
    },
    {
      id: 's6',
      name: 'Sashimi Set',
      description: '12 κομμάτια sashimi (σολομός, τόνος, γαρίδα)',
      price: 18.00,
      image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=300',
      category: 'Σούσι',
      isPopular: true,
    },
    {
      id: 's7',
      name: 'Tempura Roll',
      description: '8 κομμάτια με tempura γαρίδα',
      price: 12.50,
      image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=300',
      category: 'Σούσι',
    },
  ],
  '4': [
    {
      id: 'g1',
      name: 'Σουβλάκι Χοιρινό',
      description: '2 σουβλάκια με πίτα, πατάτες, ντομάτα, κρεμμύδι',
      price: 6.50,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300',
      category: 'Ελληνική',
      isPopular: true,
      radioOptions: {
        title: 'Τύπος Ψωμιού',
        options: [
          { id: 'r1', name: 'Πίτα', price: 0 },
          { id: 'r2', name: 'Ψωμάκι', price: 0 },
          { id: 'r3', name: 'Αραβική', price: 0.50 },
        ],
      },
    },
    {
      id: 'g2',
      name: 'Γύρος Χοιρινό',
      description: 'Γύρος με πατάτες, ντομάτα, κρεμμύδι, τζατζίκι',
      price: 7.00,
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300',
      category: 'Ελληνική',
      isPopular: true,
      radioOptions: {
        title: 'Τύπος Ψωμιού',
        options: [
          { id: 'r4', name: 'Πίτα', price: 0 },
          { id: 'r5', name: 'Αραβική', price: 0.50 },
        ],
      },
    },
    {
      id: 'g3',
      name: 'Μουσακάς',
      description: 'Παραδοσιακός μουσακάς με μπεσαμέλ',
      price: 9.50,
      image: 'https://images.unsplash.com/photo-1618219908610-ff88a59e2009?w=300',
      category: 'Ελληνική',
    },
    {
      id: 'g4',
      name: 'Παστίτσιο',
      description: 'Παραδοσιακό παστίτσιο με μπεσαμέλ',
      price: 9.00,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300',
      category: 'Ελληνική',
      isPopular: true,
    },
    {
      id: 'g5',
      name: 'Σουβλάκι Κοτόπουλο',
      description: '2 σουβλάκια με πίτα, πατάτες, ντομάτα, τζατζίκι',
      price: 6.50,
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300',
      category: 'Ελληνική',
      radioOptions: {
        title: 'Τύπος Ψωμιού',
        options: [
          { id: 'r6', name: 'Πίτα', price: 0 },
          { id: 'r7', name: 'Ψωμάκι', price: 0 },
          { id: 'r8', name: 'Αραβική', price: 0.50 },
        ],
      },
    },
    {
      id: 'g6',
      name: 'Γύρος Κοτόπουλο',
      description: 'Γύρος κοτόπουλο με πατάτες, ντομάτα, τζατζίκι',
      price: 7.00,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300',
      category: 'Ελληνική',
      radioOptions: {
        title: 'Τύπος Ψωμιού',
        options: [
          { id: 'r9', name: 'Πίτα', price: 0 },
          { id: 'r10', name: 'Αραβική', price: 0.50 },
        ],
      },
    },
    {
      id: 'g7',
      name: 'Σπανακόπιτα',
      description: 'Πίτα με σπανάκι και φέτα',
      price: 5.50,
      image: 'https://images.unsplash.com/photo-1618219908610-ff88a59e2009?w=300',
      category: 'Ελληνική',
    },
    {
      id: 'g8',
      name: 'Γεμιστά',
      description: 'Ντομάτες και πιπεριές γεμιστές με ρύζι',
      price: 8.50,
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300',
      category: 'Ελληνική',
      isPopular: true,
    },
  ],
  '5': [
    {
      id: 'a1',
      name: 'Pad Thai',
      description: 'Κλασικό pad thai με γαρίδες',
      price: 11.00,
      image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=300',
      category: 'Ασιατική',
      isPopular: true,
    },
    {
      id: 'a2',
      name: 'Ramen',
      description: 'Κλασικό ramen με χοιρινό',
      price: 10.50,
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300',
      category: 'Ασιατική',
      isPopular: true,
    },
    {
      id: 'a3',
      name: 'Chicken Teriyaki',
      description: 'Κοτόπουλο teriyaki με ρύζι',
      price: 12.00,
      image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=300',
      category: 'Ασιατική',
      isPopular: true,
    },
    {
      id: 'a4',
      name: 'Beef Stir Fry',
      description: 'Μοσχάρι wok με λαχανικά',
      price: 13.50,
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300',
      category: 'Ασιατική',
    },
    {
      id: 'a5',
      name: 'Spring Rolls',
      description: '4 spring rolls με σως',
      price: 6.50,
      image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=300',
      category: 'Ασιατική',
    },
    {
      id: 'a6',
      name: 'Sweet and Sour Chicken',
      description: 'Κοτόπουλο sweet and sour με ρύζι',
      price: 11.50,
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300',
      category: 'Ασιατική',
    },
    {
      id: 'a7',
      name: 'Fried Rice',
      description: 'Τηγανητό ρύζι με λαχανικά και αυγό',
      price: 9.00,
      image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=300',
      category: 'Ασιατική',
    },
  ],
  '6': [
    {
      id: 'd1',
      name: 'Cheesecake',
      description: 'Κλασικό cheesecake με φράουλες',
      price: 6.00,
      image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300',
      category: 'Γλυκό',
      isPopular: true,
    },
    {
      id: 'd2',
      name: 'Tiramisu',
      description: 'Ιταλικό tiramisu',
      price: 6.50,
      image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300',
      category: 'Γλυκό',
      isPopular: true,
    },
    {
      id: 'd3',
      name: 'Brownie',
      description: 'Σοκολατένιο brownie με παγωτό',
      price: 5.50,
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300',
      category: 'Γλυκό',
    },
    {
      id: 'd4',
      name: 'Chocolate Cake',
      description: 'Σοκολατένια τούρτα με κρέμα',
      price: 7.00,
      image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300',
      category: 'Γλυκό',
      isPopular: true,
    },
    {
      id: 'd5',
      name: 'Ice Cream',
      description: '3 μπάλες παγωτό (βανίλια, σοκολάτα, φράουλα)',
      price: 5.00,
      image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300',
      category: 'Γλυκό',
    },
    {
      id: 'd6',
      name: 'Baklava',
      description: 'Παραδοσιακό μπακλαβάς',
      price: 6.00,
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300',
      category: 'Γλυκό',
    },
    {
      id: 'cof1',
      name: 'Espresso',
      description: 'Κλασικό espresso',
      price: 2.50,
      image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=300',
      category: 'Καφέδες',
    },
    {
      id: 'cof2',
      name: 'Cappuccino',
      description: 'Espresso με αφρόγαλα',
      price: 3.50,
      image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=300',
      category: 'Καφέδες',
      isPopular: true,
    },
    {
      id: 'cof3',
      name: 'Freddo Espresso',
      description: 'Κρύο espresso',
      price: 3.00,
      image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=300',
      category: 'Καφέδες',
      isPopular: true,
    },
    {
      id: 'cof4',
      name: 'Frappe',
      description: 'Κρύος καφές με γάλα',
      price: 3.50,
      image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=300',
      category: 'Καφέδες',
    },
  ],
};

