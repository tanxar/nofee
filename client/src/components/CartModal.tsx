import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, SlideInDown, FadeIn, FadeOut, Easing, useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CartModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CartModal({ visible, onClose }: CartModalProps) {
  const navigation = useNavigation();
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const [modalVisible, setModalVisible] = React.useState(visible);
  const overlayOpacity = useSharedValue(0);
  const modalTranslateY = useSharedValue(1000);

  React.useEffect(() => {
    if (visible) {
      setModalVisible(true);
      overlayOpacity.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.ease) });
      modalTranslateY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) });
    } else if (modalVisible) {
      overlayOpacity.value = withTiming(0, { duration: 250 });
      modalTranslateY.value = withTiming(1000, { duration: 300, easing: Easing.in(Easing.ease) }, (finished) => {
        if (finished) {
          runOnJS(setModalVisible)(false);
          runOnJS(onClose)();
        }
      });
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity.value,
    };
  });

  const modalStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: modalTranslateY.value }],
    };
  });

  const handleClose = () => {
    if (visible) {
      overlayOpacity.value = withTiming(0, { duration: 250 });
      modalTranslateY.value = withTiming(1000, { duration: 300, easing: Easing.in(Easing.ease) }, (finished) => {
        if (finished) {
          runOnJS(setModalVisible)(false);
          runOnJS(onClose)();
        }
      });
    }
  };

  const handleCheckout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
    setTimeout(() => {
      (navigation as any).navigate('Checkout');
    }, 300);
  };

  return (
    <Modal
      visible={modalVisible}
      animationType="none"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[styles.backdropContainer, overlayStyle]}
        >
          <Pressable style={styles.backdrop} onPress={handleClose} />
        </Animated.View>
        <Animated.View 
          style={[styles.modalContent, modalStyle]}
        >
          <SafeAreaView edges={['bottom']} style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
            <Text style={styles.headerTitle}>Το Καλάθι μου</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
            </View>

            {cartItems.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="cart-outline" size={64} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>Το καλάθι σας είναι άδειο</Text>
                <Text style={styles.emptyText}>Προσθέστε προϊόντα για να συνεχίσετε</Text>
              </View>
            ) : (
              <>
                <ScrollView 
                  style={styles.scrollView} 
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContent}
                >
                  {cartItems.map((item, index) => (
                    <Animated.View
                      key={item.cartItemId}
                      entering={FadeInDown.delay(index * 50).springify()}
                      style={styles.cartItem}
                    >
                      <Image source={{ uri: item.image }} style={styles.cartItemImage} />
                      <View style={styles.cartItemInfo}>
                        <Text style={styles.cartItemName}>{item.name}</Text>
                        <Text style={styles.cartItemDescription} numberOfLines={1}>
                          {item.description}
                        </Text>
                        {item.selectedRadioOption && (
                          <View style={styles.extrasContainer}>
                            <Text style={styles.extraText}>
                              {item.selectedRadioOption.name}
                              {item.selectedRadioOption.price !== undefined && item.selectedRadioOption.price > 0 && (
                                <Text style={styles.extraPriceText}> (+€{item.selectedRadioOption.price.toFixed(2)})</Text>
                              )}
                            </Text>
                          </View>
                        )}
                        {item.selectedExtras && item.selectedExtras.length > 0 && (
                          <View style={styles.extrasContainer}>
                            {item.selectedExtras.map((extra) => (
                              <Text key={extra.id} style={styles.extraText}>
                                + {extra.name} (+€{extra.price.toFixed(2)})
                              </Text>
                            ))}
                          </View>
                        )}
                        <View style={styles.cartItemFooter}>
                          <Text style={styles.cartItemPrice}>€{((item.totalPrice || item.price) * item.quantity).toFixed(2)}</Text>
                          <View style={styles.quantityControls}>
                            <TouchableOpacity
                              style={styles.quantityButton}
                              onPress={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            >
                              <Ionicons name="remove" size={18} color="#111827" />
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{item.quantity}</Text>
                            <TouchableOpacity
                              style={styles.quantityButton}
                              onPress={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            >
                              <Ionicons name="add" size={18} color="#111827" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeFromCart(item.cartItemId)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </ScrollView>

                {/* Footer */}
                <Animated.View entering={FadeInUp.springify()} style={styles.footer}>
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Σύνολο</Text>
                    <Text style={styles.totalPrice}>€{getTotalPrice().toFixed(2)}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.checkoutButton} 
                    onPress={handleCheckout}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.checkoutButtonText}>Ολοκλήρωση Παραγγελίας</Text>
                  </TouchableOpacity>
                </Animated.View>
              </>
            )}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: SCREEN_HEIGHT * 0.85,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  safeArea: {
    flex: 1,
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.4,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 18,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cartItemImage: {
    width: 85,
    height: 85,
    borderRadius: 12,
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  cartItemName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  cartItemDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
    lineHeight: 20,
  },
  extrasContainer: {
    marginBottom: 8,
    gap: 4,
  },
  extraText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  extraPriceText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  cartItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  cartItemPrice: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FF6B35',
    letterSpacing: -0.2,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  quantityButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  quantityText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    minWidth: 28,
    textAlign: 'center',
  },
  removeButton: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    borderRadius: 17,
    backgroundColor: '#FEE2E2',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  totalPrice: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FF6B35',
    letterSpacing: -0.4,
  },
  checkoutButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

