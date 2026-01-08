import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  withTiming,
  runOnJS,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { MenuItem, MenuItemExtra, MenuItemRadioOption } from '../data/mockData';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const SCREEN_HEIGHT = height;

interface ProductModalProps {
  visible: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (item: MenuItem, selectedExtras: MenuItemExtra[], totalPrice: number, selectedRadioOption?: MenuItemRadioOption | null) => void;
}

export default function ProductModal({ visible, item, onClose, onAddToCart }: ProductModalProps) {
  const [selectedExtras, setSelectedExtras] = useState<MenuItemExtra[]>([]);
  const [selectedRadioOption, setSelectedRadioOption] = useState<MenuItemRadioOption | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const overlayOpacity = useSharedValue(0);
  const modalTranslateY = useSharedValue(SCREEN_HEIGHT);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: modalTranslateY.value }],
  }));

  useEffect(() => {
    if (visible && item) {
      setIsVisible(true);
      overlayOpacity.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.ease) });
      modalTranslateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });
      setSelectedExtras([]);
      // Set default radio option (first one) if exists
      if (item.radioOptions && item.radioOptions.options.length > 0) {
        setSelectedRadioOption(item.radioOptions.options[0]);
      } else {
        setSelectedRadioOption(null);
      }
    } else if (!visible && isVisible) {
      overlayOpacity.value = withTiming(0, { duration: 250 });
      modalTranslateY.value = withTiming(SCREEN_HEIGHT, { duration: 300, easing: Easing.in(Easing.ease) }, () => {
        runOnJS(setIsVisible)(false);
        runOnJS(onClose)();
      });
    }
  }, [visible, item, isVisible]);

  if (!item) return null;

  const toggleExtra = (extra: MenuItemExtra) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedExtras((prev) => {
      const exists = prev.find((e) => e.id === extra.id);
      if (exists) {
        return prev.filter((e) => e.id !== extra.id);
      } else {
        return [...prev, extra];
      }
    });
  };

  const calculateTotalPrice = () => {
    const extrasPrice = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
    const radioPrice = selectedRadioOption?.price || 0;
    return item.price + extrasPrice + radioPrice;
  };

  const selectRadioOption = (option: MenuItemRadioOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRadioOption(option);
  };

  const handleAddToCart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const totalPrice = calculateTotalPrice();
    onAddToCart(item, selectedExtras, totalPrice, selectedRadioOption);
    overlayOpacity.value = withTiming(0, { duration: 250 });
    modalTranslateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
      runOnJS(setIsVisible)(false);
      runOnJS(onClose)();
    });
  };

  const totalPrice = calculateTotalPrice();

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={() => {
        overlayOpacity.value = withTiming(0, { duration: 250 });
        modalTranslateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
          runOnJS(setIsVisible)(false);
          runOnJS(onClose)();
        });
      }}
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            backdropStyle,
          ]}
        >
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={() => {
              overlayOpacity.value = withTiming(0, { duration: 250 });
              modalTranslateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
                runOnJS(setIsVisible)(false);
                runOnJS(onClose)();
              });
            }}
          />
        </Animated.View>

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContent,
            modalStyle,
          ]}
        >
          <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{item.name}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  overlayOpacity.value = withTiming(0, { duration: 250 });
                  modalTranslateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
                    runOnJS(setIsVisible)(false);
                    runOnJS(onClose)();
                  });
                }}
              >
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContentContainer}
            >
              {/* Image */}
              <Image source={{ uri: item.image }} style={styles.productImage} />

              {/* Description */}
              <View style={styles.descriptionContainer}>
                <Text style={styles.description}>{item.description}</Text>
                <Text style={styles.basePrice}>€{item.price.toFixed(2)}</Text>
              </View>

              {/* Radio Options */}
              {item.radioOptions && item.radioOptions.options.length > 0 && (
                <View style={styles.radioSection}>
                  <View style={styles.radioTitleContainer}>
                    <Ionicons name="radio-button-on-outline" size={20} color="#111827" />
                    <Text style={styles.radioTitle}>{item.radioOptions.title}</Text>
                  </View>
                  <View style={styles.radioList}>
                    {item.radioOptions.options.map((option) => {
                      const isSelected = selectedRadioOption?.id === option.id;
                      return (
                        <TouchableOpacity
                          key={option.id}
                          style={[styles.radioItem, isSelected && styles.radioItemSelected]}
                          onPress={() => selectRadioOption(option)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.radioContent}>
                            <View style={styles.radioLeft}>
                              <View
                                style={[
                                  styles.radioButton,
                                  isSelected && styles.radioButtonSelected,
                                ]}
                              >
                                {isSelected && (
                                  <View style={styles.radioButtonInner} />
                                )}
                              </View>
                              <View style={styles.radioTextContainer}>
                                <Text style={[styles.radioName, isSelected && styles.radioNameSelected]}>
                                  {option.name}
                                </Text>
                                {option.price !== undefined && option.price > 0 && (
                                  <Text style={[styles.radioPriceLabel, isSelected && styles.radioPriceLabelSelected]}>
                                    Επιπλέον χρέωση
                                  </Text>
                                )}
                              </View>
                            </View>
                            {option.price !== undefined && option.price > 0 && (
                              <View style={[styles.priceBadge, isSelected && styles.priceBadgeSelected]}>
                                <Text style={[styles.radioPrice, isSelected && styles.radioPriceSelected]}>
                                  +€{option.price.toFixed(2)}
                                </Text>
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Extras */}
              {item.extras && item.extras.length > 0 && (
                <View style={styles.extrasSection}>
                  <View style={styles.extrasTitleContainer}>
                    <Ionicons name="add-circle-outline" size={20} color="#111827" />
                    <Text style={styles.extrasTitle}>Επιπλέον Υλικά</Text>
                  </View>
                  <View style={styles.extrasList}>
                    {item.extras.map((extra) => {
                      const isSelected = selectedExtras.some((e) => e.id === extra.id);
                      return (
                        <TouchableOpacity
                          key={extra.id}
                          style={[styles.extraItem, isSelected && styles.extraItemSelected]}
                          onPress={() => toggleExtra(extra)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.extraContent}>
                            <View style={styles.extraLeft}>
                              <View
                                style={[
                                  styles.checkbox,
                                  isSelected && styles.checkboxSelected,
                                ]}
                              >
                            {isSelected && (
                              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                            )}
                              </View>
                              <View style={styles.extraTextContainer}>
                                <Text style={[styles.extraName, isSelected && styles.extraNameSelected]}>
                                  {extra.name}
                                </Text>
                                {extra.price > 0 && (
                                  <Text style={[styles.extraPriceLabel, isSelected && styles.extraPriceLabelSelected]}>
                                    Επιπλέον χρέωση
                                  </Text>
                                )}
                              </View>
                            </View>
                            {extra.price > 0 && (
                              <View style={[styles.priceBadge, isSelected && styles.priceBadgeSelected]}>
                                <Text style={[styles.extraPrice, isSelected && styles.extraPriceSelected]}>
                                  +€{extra.price.toFixed(2)}
                                </Text>
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.footerPrice}>
                <Text style={styles.footerPriceLabel}>Σύνολο</Text>
                <Text style={styles.footerPriceValue}>€{totalPrice.toFixed(2)}</Text>
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddToCart}
                activeOpacity={0.9}
              >
                <Text style={styles.addButtonText}>Προσθήκη στο Καλάθι</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    flex: 1,
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.9,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  safeArea: {
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
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  productImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  descriptionContainer: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 12,
    fontWeight: '500',
  },
  basePrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B35',
  },
  extrasSection: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 20,
  },
  extrasTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  extrasTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  extrasList: {
    gap: 8,
  },
  extraItem: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  extraItemSelected: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FF6B35',
    borderWidth: 2,
    elevation: 3,
    shadowColor: '#FF6B35',
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  extraContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  extraLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.08,
    shadowRadius: 1.5,
  },
  checkboxSelected: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
    elevation: 1.5,
    shadowColor: '#FF6B35',
    shadowOpacity: 0.25,
  },
  extraTextContainer: {
    flex: 1,
    gap: 1,
  },
  extraName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    letterSpacing: -0.1,
  },
  extraNameSelected: {
    color: '#111827',
    fontWeight: '700',
  },
  extraPriceLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 1,
  },
  extraPriceLabelSelected: {
    color: '#6B7280',
  },
  priceBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  priceBadgeSelected: {
    backgroundColor: '#FF6B35',
  },
  extraPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.1,
  },
  extraPriceSelected: {
    color: '#FFFFFF',
  },
  radioSection: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 20,
  },
  radioTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  radioTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  radioList: {
    gap: 8,
  },
  radioItem: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  radioItemSelected: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FF6B35',
    borderWidth: 2,
    elevation: 3,
    shadowColor: '#FF6B35',
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  radioContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  radioLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.08,
    shadowRadius: 1.5,
  },
  radioButtonSelected: {
    borderColor: '#FF6B35',
    elevation: 1.5,
    shadowColor: '#FF6B35',
    shadowOpacity: 0.25,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B35',
  },
  radioTextContainer: {
    flex: 1,
    gap: 1,
  },
  radioName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    letterSpacing: -0.1,
  },
  radioNameSelected: {
    color: '#111827',
    fontWeight: '700',
  },
  radioPriceLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 1,
  },
  radioPriceLabelSelected: {
    color: '#6B7280',
  },
  radioPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.1,
  },
  radioPriceSelected: {
    color: '#FFFFFF',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  footerPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  footerPriceLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  footerPriceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FF6B35',
    letterSpacing: -0.5,
  },
  addButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

