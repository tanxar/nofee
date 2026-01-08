import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { useCart } from '../context/CartContext';
import { restaurants } from '../data/mockData';
import MapModal from '../components/MapModal';

type PaymentMethod = 'card' | 'cash' | 'digital';

interface Address {
  id: string;
  label: string;
  address: string;
  isDefault?: boolean;
}

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { cartItems, getTotalPrice, clearCart, currentRestaurantId } = useCart();
  
  // Mock saved addresses - in real app, these would come from user profile/API
  const [savedAddresses] = useState<Address[]>([
    {
      id: '1',
      label: 'Σπίτι',
      address: 'Λεωφόρος Πατησίων 123, Αθήνα 11141',
      isDefault: true,
    },
    {
      id: '2',
      label: 'Γραφείο',
      address: 'Συγγρού 45, Αθήνα 11742',
    },
  ]);
  
  const [selectedAddressId, setSelectedAddressId] = useState<string>(savedAddresses.find(a => a.isDefault)?.id || savedAddresses[0]?.id || '');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState<string>('');
  const [newAddressText, setNewAddressText] = useState<string>('');
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [tipPercentage, setTipPercentage] = useState<number | null>(15);
  const [customTip, setCustomTip] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  
  const selectedAddress = savedAddresses.find(a => a.id === selectedAddressId);
  const deliveryAddress = selectedAddress?.address || '';

  const restaurant = restaurants.find((r) => r.id === currentRestaurantId);
  const subtotal = getTotalPrice();
  const tipAmount = tipPercentage !== null 
    ? subtotal * (tipPercentage / 100)
    : parseFloat(customTip) || 0;
  const deliveryFee = restaurant?.deliveryFee || 0;
  const total = subtotal + tipAmount + deliveryFee;

  const handleMapConfirm = (address: string, coordinates: { latitude: number; longitude: number }) => {
    setNewAddressText(address);
    setShowMapModal(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleAddAddress = () => {
    if (!newAddressLabel.trim() || !newAddressText.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Σφάλμα',
        text2: 'Παρακαλώ συμπληρώστε όλα τα πεδία',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    // In real app, this would save to API/user profile
    const newAddress: Address = {
      id: Date.now().toString(),
      label: newAddressLabel,
      address: newAddressText,
    };
    
    // For demo purposes, we'll just select it
    setSelectedAddressId(newAddress.id);
    setShowAddAddress(false);
    setNewAddressLabel('');
    setNewAddressText('');
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Toast.show({
      type: 'success',
      text1: 'Η διεύθυνση προστέθηκε!',
      position: 'top',
      visibilityTime: 2000,
    });
  };

  const handleConfirmOrder = () => {
    if (!deliveryAddress.trim() && deliveryFee > 0) {
      Toast.show({
        type: 'error',
        text1: 'Σφάλμα',
        text2: 'Παρακαλώ επιλέξτε διεύθυνση παράδοσης',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    clearCart();
    
    Toast.show({
      type: 'success',
      text1: 'Η παραγγελία ολοκληρώθηκε! 🎉',
      text2: 'Σας ευχαριστούμε!',
      position: 'top',
      visibilityTime: 3000,
    });

    setTimeout(() => {
      (navigation as any).navigate('Home');
    }, 1500);
  };

  const tipOptions = [10, 15, 20];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={insets.top}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ολοκλήρωση Παραγγελίας</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Restaurant Info */}
          {restaurant && (
            <Animated.View entering={FadeInDown.delay(50)} style={styles.restaurantCard}>
              <View style={styles.restaurantHeader}>
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
                  <Text style={styles.restaurantCuisine}>{restaurant.cuisine}</Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={16} color="#92400E" />
                  <Text style={styles.ratingText}>{restaurant.rating}</Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Order Summary */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
            <Text style={styles.sectionTitle}>Σύνοψη Παραγγελίας</Text>
            <View style={styles.summaryCard}>
              {cartItems.map((item, index) => (
                <View key={item.cartItemId} style={styles.summaryItem}>
                  <View style={styles.summaryItemLeft}>
                    <Text style={styles.summaryItemQuantity}>{item.quantity}x</Text>
                    <Text style={styles.summaryItemName}>{item.name}</Text>
                  </View>
                  <Text style={styles.summaryItemPrice}>
                    €{(item.totalPrice || item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Delivery Address */}
          {deliveryFee > 0 && (
            <Animated.View entering={FadeInDown.delay(150)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitleInHeader}>Διεύθυνση Παράδοσης</Text>
                {!showAddAddress && (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowAddAddress(true);
                    }}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#FF6B35" />
                    <Text style={styles.addButtonText}>Προσθήκη</Text>
                  </TouchableOpacity>
                )}
              </View>

              {!showAddAddress ? (
                <View style={styles.addressesCard}>
                  {savedAddresses.map((address) => (
                    <TouchableOpacity
                      key={address.id}
                      style={[
                        styles.addressOption,
                        selectedAddressId === address.id && styles.addressOptionActive,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedAddressId(address.id);
                      }}
                    >
                      <View style={styles.addressContent}>
                        <View style={styles.addressHeader}>
                          <Ionicons
                            name="location"
                            size={20}
                            color={selectedAddressId === address.id ? '#FF6B35' : '#6B7280'}
                          />
                          <Text
                            style={[
                              styles.addressLabel,
                              selectedAddressId === address.id && styles.addressLabelActive,
                            ]}
                          >
                            {address.label}
                          </Text>
                          {address.isDefault && (
                            <View style={styles.defaultBadge}>
                              <Text style={styles.defaultBadgeText}>Προεπιλογή</Text>
                            </View>
                          )}
                        </View>
                        <Text
                          style={[
                            styles.addressText,
                            selectedAddressId === address.id && styles.addressTextActive,
                          ]}
                        >
                          {address.address}
                        </Text>
                      </View>
                      {selectedAddressId === address.id && (
                        <View style={styles.addressCheckmark}>
                          <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.addAddressCard}>
                  <View style={styles.addAddressHeader}>
                    <Text style={styles.addAddressTitle}>Νέα Διεύθυνση</Text>
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setShowAddAddress(false);
                        setNewAddressLabel('');
                        setNewAddressText('');
                      }}
                    >
                      <Ionicons name="close-circle" size={24} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.inputCard}>
                    <Ionicons name="pricetag-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Ετικέτα (π.χ. Σπίτι, Γραφείο)"
                      placeholderTextColor="#9CA3AF"
                      value={newAddressLabel}
                      onChangeText={setNewAddressLabel}
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.inputCard, { marginTop: 14 }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowMapModal(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="location-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                    <View style={styles.addressInputContainer}>
                      {newAddressText ? (
                        <Text style={styles.addressInputText} numberOfLines={2}>
                          {newAddressText}
                        </Text>
                      ) : (
                        <Text style={styles.addressInputPlaceholder}>
                          Επιλέξτε διεύθυνση από χάρτη
                        </Text>
                      )}
                      <Ionicons name="map-outline" size={20} color="#FF6B35" />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.saveAddressButton, { marginTop: 8 }]}
                    onPress={handleAddAddress}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.saveAddressButtonText}>Αποθήκευση Διεύθυνσης</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          )}

          {/* Payment Method */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
            <Text style={styles.sectionTitle}>Τρόπος Πληρωμής</Text>
            <View style={styles.paymentCard}>
              <TouchableOpacity
                style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentOptionActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setPaymentMethod('card');
                }}
              >
                <Ionicons
                  name="card-outline"
                  size={24}
                  color={paymentMethod === 'card' ? '#FF6B35' : '#6B7280'}
                />
                <Text style={[styles.paymentText, paymentMethod === 'card' && styles.paymentTextActive]}>
                  Κάρτα
                </Text>
                {paymentMethod === 'card' && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.paymentOption, paymentMethod === 'cash' && styles.paymentOptionActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setPaymentMethod('cash');
                }}
              >
                <Ionicons
                  name="cash-outline"
                  size={24}
                  color={paymentMethod === 'cash' ? '#FF6B35' : '#6B7280'}
                />
                <Text style={[styles.paymentText, paymentMethod === 'cash' && styles.paymentTextActive]}>
                  Μετρητά
                </Text>
                {paymentMethod === 'cash' && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.paymentOption, paymentMethod === 'digital' && styles.paymentOptionActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setPaymentMethod('digital');
                }}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={24}
                  color={paymentMethod === 'digital' ? '#FF6B35' : '#6B7280'}
                />
                <Text style={[styles.paymentText, paymentMethod === 'digital' && styles.paymentTextActive]}>
                  Digital Wallet
                </Text>
                {paymentMethod === 'digital' && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Tip Selection */}
          <Animated.View entering={FadeInDown.delay(250)} style={styles.section}>
            <Text style={styles.sectionTitle}>Φιλοδώρημα</Text>
            <View style={styles.tipCard}>
              <View style={styles.tipOptions}>
                {tipOptions.map((percentage) => (
                  <TouchableOpacity
                    key={percentage}
                    style={[
                      styles.tipButton,
                      tipPercentage === percentage && styles.tipButtonActive,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setTipPercentage(percentage);
                      setCustomTip('');
                    }}
                  >
                    <Text
                      style={[
                        styles.tipButtonText,
                        tipPercentage === percentage && styles.tipButtonTextActive,
                      ]}
                    >
                      {percentage}%
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[
                    styles.tipButton,
                    tipPercentage === null && styles.tipButtonActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setTipPercentage(null);
                  }}
                >
                  <Text
                    style={[
                      styles.tipButtonText,
                      tipPercentage === null && styles.tipButtonTextActive,
                    ]}
                  >
                    Άλλο
                  </Text>
                </TouchableOpacity>
              </View>
              {tipPercentage === null && (
                <View style={styles.customTipContainer}>
                  <TextInput
                    style={styles.customTipInput}
                    placeholder="€0.00"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="decimal-pad"
                    value={customTip}
                    onChangeText={setCustomTip}
                  />
                </View>
              )}
              {tipAmount > 0 && (
                <View style={styles.tipAmountContainer}>
                  <Text style={styles.tipAmountLabel}>Σύνολο φιλοδωρήματος:</Text>
                  <Text style={styles.tipAmount}>€{tipAmount.toFixed(2)}</Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Order Notes */}
          <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
            <Text style={styles.sectionTitle}>Σχόλια Παραγγελίας</Text>
            <View style={styles.inputCard}>
              <Ionicons name="chatbubble-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Π.χ. Χωρίς κρεμμύδια, παράθυρο..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                value={orderNotes}
                onChangeText={setOrderNotes}
                textAlignVertical="top"
              />
            </View>
          </Animated.View>

          {/* Total Summary */}
          <Animated.View entering={FadeInDown.delay(350)} style={styles.section}>
            <View style={styles.totalCard}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Υποσύνολο</Text>
                <Text style={styles.totalValue}>€{subtotal.toFixed(2)}</Text>
              </View>
              {deliveryFee > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Κόστος Παράδοσης</Text>
                  <Text style={styles.totalValue}>€{deliveryFee.toFixed(2)}</Text>
                </View>
              )}
              {tipAmount > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Φιλοδώρημα</Text>
                  <Text style={styles.totalValue}>€{tipAmount.toFixed(2)}</Text>
                </View>
              )}
              <View style={styles.totalDivider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalFinalLabel}>Σύνολο</Text>
                <Text style={styles.totalFinalValue}>€{total.toFixed(2)}</Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Confirm Button */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.footer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmOrder}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>
              Επιβεβαίωση Παραγγελίας - €{total.toFixed(2)}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Map Modal */}
      <MapModal
        visible={showMapModal}
        onClose={() => setShowMapModal(false)}
        onConfirm={handleMapConfirm}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  restaurantCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  restaurantCuisine: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  sectionTitleInHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.2,
    marginBottom: 18,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FF6B35',
  },
  addressesCard: {
    gap: 12,
  },
  addressOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  addressOptionActive: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F2',
  },
  addressContent: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  addressLabelActive: {
    color: '#FF6B35',
  },
  addressText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
    lineHeight: 20,
  },
  addressTextActive: {
    color: '#111827',
  },
  defaultBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  addressCheckmark: {
    marginLeft: 12,
  },
  addAddressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  addAddressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addAddressTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  saveAddressButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  saveAddressButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  summaryItemQuantity: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
    marginRight: 12,
    minWidth: 30,
  },
  summaryItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  summaryItemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B35',
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  inputIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    paddingVertical: 0,
  },
  addressInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  addressInputText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    lineHeight: 22,
  },
  addressInputPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  textArea: {
    minHeight: 90,
    paddingTop: 4,
  },
  paymentCard: {
    gap: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  paymentOptionActive: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F2',
  },
  paymentText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 12,
  },
  paymentTextActive: {
    color: '#FF6B35',
  },
  checkmark: {
    marginLeft: 'auto',
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  tipOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  tipButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tipButtonActive: {
    backgroundColor: '#FFF5F2',
    borderColor: '#FF6B35',
  },
  tipButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  tipButtonTextActive: {
    color: '#FF6B35',
  },
  customTipContainer: {
    marginTop: 8,
  },
  customTipInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  tipAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  tipAmountLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  tipAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B35',
  },
  totalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  totalFinalLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  totalFinalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B35',
    letterSpacing: -0.5,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  confirmButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

