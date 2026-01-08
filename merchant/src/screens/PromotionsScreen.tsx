import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { mockPromotions, Promotion } from '../data/mockData';
import Toast from 'react-native-toast-message';

export default function PromotionsScreen() {
  const [promotions, setPromotions] = useState(mockPromotions);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  const togglePromotion = (id: string) => {
    setPromotions((prev) =>
      prev.map((promo) =>
        promo.id === id ? { ...promo, active: !promo.active } : promo
      )
    );
    Toast.show({
      type: 'success',
      text1: 'Ενημερώθηκε',
      text2: 'Η κατάσταση της προσφοράς άλλαξε',
    });
  };

  const deletePromotion = (id: string) => {
    setPromotions((prev) => prev.filter((promo) => promo.id !== id));
    Toast.show({
      type: 'success',
      text1: 'Διαγράφηκε',
      text2: 'Η προσφορά διαγράφηκε',
    });
  };

  const getPromotionTypeText = (type: Promotion['type']) => {
    switch (type) {
      case 'percentage':
        return 'Ποσοστό';
      case 'fixed':
        return 'Σταθερό Ποσό';
      case 'buy_x_get_y':
        return 'Αγόρασε X Πάρε Y';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('el-GR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const isActive = (promo: Promotion) => {
    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);
    return promo.active && now >= start && now <= end;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Προσφορές</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingPromotion(null);
            setIsModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {promotions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="pricetag-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>Δεν υπάρχουν προσφορές</Text>
          </View>
        ) : (
          promotions.map((promotion, index) => (
            <Animated.View
              key={promotion.id}
              entering={FadeInDown.delay(100 * index)}
            >
              <View style={styles.promotionCard}>
                <View style={styles.promotionHeader}>
                  <View style={styles.promotionInfo}>
                    <Text style={styles.promotionName}>{promotion.name}</Text>
                    <View style={styles.promotionBadges}>
                      {isActive(promotion) && (
                        <View style={styles.activeBadge}>
                          <Text style={styles.activeBadgeText}>Ενεργή</Text>
                        </View>
                      )}
                      <View
                        style={[
                          styles.typeBadge,
                          { backgroundColor: getPromotionTypeColor(promotion.type) + '20' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.typeBadgeText,
                            { color: getPromotionTypeColor(promotion.type) },
                          ]}
                        >
                          {getPromotionTypeText(promotion.type)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Switch
                    value={promotion.active}
                    onValueChange={() => togglePromotion(promotion.id)}
                    trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                    thumbColor="#FFF"
                  />
                </View>

                <Text style={styles.promotionDescription}>{promotion.description}</Text>

                <View style={styles.promotionDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>
                      {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="pricetag-outline" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>
                      {promotion.type === 'percentage'
                        ? `${promotion.value}%`
                        : promotion.type === 'fixed'
                        ? `€${promotion.value.toFixed(2)}`
                        : `${promotion.value} δωρεάν`}
                    </Text>
                  </View>
                  {promotion.minOrderAmount && (
                    <View style={styles.detailRow}>
                      <Ionicons name="cash-outline" size={16} color="#6B7280" />
                      <Text style={styles.detailText}>
                        Ελάχιστη παραγγελία: €{promotion.minOrderAmount.toFixed(2)}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.promotionActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                      setEditingPromotion(promotion);
                      setIsModalVisible(true);
                    }}
                  >
                    <Ionicons name="create-outline" size={18} color="#3B82F6" />
                    <Text style={styles.editButtonText}>Επεξεργασία</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deletePromotion(promotion.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    <Text style={styles.deleteButtonText}>Διαγραφή</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          ))
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setIsModalVisible(false);
          setEditingPromotion(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingPromotion ? 'Επεξεργασία Προσφοράς' : 'Νέα Προσφορά'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsModalVisible(false);
                  setEditingPromotion(null);
                }}
              >
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={styles.modalNote}>
                Η λειτουργία επεξεργασίας προσφορών θα προστεθεί σύντομα
              </Text>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsModalVisible(false);
                  setEditingPromotion(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Κλείσιμο</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getPromotionTypeColor = (type: Promotion['type']) => {
  switch (type) {
    case 'percentage':
      return '#FF6B35';
    case 'fixed':
      return '#10B981';
    case 'buy_x_get_y':
      return '#3B82F6';
    default:
      return '#6B7280';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  promotionCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  promotionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  promotionInfo: {
    flex: 1,
  },
  promotionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  promotionBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  activeBadge: {
    backgroundColor: '#10B98120',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  promotionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  promotionDetails: {
    gap: 8,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  promotionActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    gap: 8,
  },
  editButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalNote: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    padding: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 16,
  },
});

