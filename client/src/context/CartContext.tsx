import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import * as Haptics from 'expo-haptics';
import { MenuItemRadioOption } from '../data/mockData';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface MenuItemExtra {
  id: string;
  name: string;
  price: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
  restaurantId: string;
  selectedExtras?: MenuItemExtra[];
  selectedRadioOption?: MenuItemRadioOption | null;
  totalPrice: number;
  cartItemId: string; // Unique identifier for this cart item (item + extras + radio combination)
}

interface CartContextType {
  cartItems: CartItem[];
  currentRestaurantId: string | null;
  addToCart: (item: MenuItem, restaurantId: string, selectedExtras?: MenuItemExtra[], totalPrice?: number, selectedRadioOption?: MenuItemRadioOption | null) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentRestaurantId, setCurrentRestaurantId] = useState<string | null>(null);

  // Helper function to generate unique cart item ID
  const generateCartItemId = (itemId: string, extras: MenuItemExtra[], radioOption?: MenuItemRadioOption | null): string => {
    const extrasIds = extras.length > 0 
      ? extras.map(e => e.id).sort().join(',')
      : '';
    const radioId = radioOption ? `_r${radioOption.id}` : '';
    const baseId = extrasIds ? `${itemId}_${extrasIds}` : itemId;
    return radioId ? `${baseId}${radioId}` : baseId;
  };

  const addToCart = (item: MenuItem, restaurantId: string, selectedExtras?: MenuItemExtra[], totalPrice?: number, selectedRadioOption?: MenuItemRadioOption | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const finalPrice = totalPrice || item.price;
    const finalExtras = selectedExtras || [];
    const finalRadioOption = selectedRadioOption || null;
    const cartItemId = generateCartItemId(item.id, finalExtras, finalRadioOption);
    
    setCartItems((prevItems) => {
      // Ελέγχουμε αν υπάρχουν items από διαφορετικό restaurant
      const hasItemsFromOtherRestaurant = prevItems.length > 0 && 
        prevItems.some((cartItem) => cartItem.restaurantId !== restaurantId);
      
      // Αν το καλάθι έχει προϊόντα από άλλο restaurant, καθάρισέ το πρώτα
      if (hasItemsFromOtherRestaurant) {
        setCurrentRestaurantId(restaurantId);
        return [{ ...item, quantity: 1, restaurantId, selectedExtras: finalExtras, selectedRadioOption: finalRadioOption, totalPrice: finalPrice, cartItemId }];
      }

      // Αν είναι το πρώτο προϊόν, ορίζουμε το restaurantId
      if (prevItems.length === 0) {
        setCurrentRestaurantId(restaurantId);
      }

      // Check if item with same cartItemId exists
      const existingItem = prevItems.find((cartItem) => cartItem.cartItemId === cartItemId);
      
      if (existingItem) {
        return prevItems.map((cartItem) =>
          cartItem.cartItemId === cartItemId
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevItems, { ...item, quantity: 1, restaurantId, selectedExtras: finalExtras, selectedRadioOption: finalRadioOption, totalPrice: finalPrice, cartItemId }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCartItems((prevItems) => {
      const newItems = prevItems.filter((i) => i.cartItemId !== cartItemId);
      // Αν το καλάθι έμεινε άδειο, καθάρισε το restaurantId
      if (newItems.length === 0) {
        setCurrentRestaurantId(null);
      }
      return newItems;
    });
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCartItems([]);
    setCurrentRestaurantId(null);
  }, []);

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.totalPrice || item.price) * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        currentRestaurantId,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

