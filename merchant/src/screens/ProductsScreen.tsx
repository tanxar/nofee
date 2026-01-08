import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../context/ProductsContext';
import { Product } from '../services/productsService';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';

export default function ProductsScreen() {
  const { 
    products, 
    loading, 
    error, 
    refreshProducts,
    toggleProductAvailability, 
    updateProduct, 
    deleteProduct, 
    addProduct 
  } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggleAvailability = (productId: string) => {
    toggleProductAvailability(productId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Toast.show({
      type: 'success',
      text1: 'Ενημερώθηκε',
      text2: 'Η διαθεσιμότητα του προϊόντος άλλαξε',
    });
  };

  const handleDelete = (productId: string) => {
    deleteProduct(productId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Toast.show({
      type: 'success',
      text1: 'Διαγράφηκε',
      text2: 'Το προϊόν διαγράφηκε',
    });
    setSelectedProduct(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Προϊόντα</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setSelectedProduct({
              id: Date.now().toString(),
              name: '',
              description: '',
              price: 0,
              category: '',
              available: true,
            });
            setIsEditModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Αναζήτηση προϊόντων..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
              ]}
            >
              {category === 'all' ? 'Όλα' : category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products List */}
      <ScrollView 
        style={styles.productsList} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshProducts} />
        }
      >
        {loading && products.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Φόρτωση...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={refreshProducts}
            >
              <Text style={styles.retryButtonText}>Δοκίμασε ξανά</Text>
            </TouchableOpacity>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>Δεν υπάρχουν προϊόντα</Text>
          </View>
        ) : (
          filteredProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => {
                setSelectedProduct(product);
                setIsEditModalVisible(true);
              }}
            >
              <View style={styles.productInfo}>
                <View style={styles.productHeader}>
                  <Text style={styles.productName}>{product.name}</Text>
                  {!product.available && (
                    <View style={styles.unavailableBadge}>
                      <Text style={styles.unavailableText}>Μη διαθέσιμο</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.productDescription} numberOfLines={2}>
                  {product.description}
                </Text>
                <View style={styles.productFooter}>
                  <Text style={styles.productPrice}>€{product.price.toFixed(2)}</Text>
                  <Text style={styles.productCategory}>{product.category}</Text>
                </View>
              </View>
              <View style={styles.productActions}>
                <Switch
                  value={product.available}
                  onValueChange={() => handleToggleAvailability(product.id)}
                  trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                  thumbColor="#FFF"
                />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Edit Product Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setIsEditModalVisible(false);
          setSelectedProduct(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedProduct?.id && products.find((p) => p.id === selectedProduct.id)
                  ? 'Επεξεργασία Προϊόντος'
                  : 'Νέο Προϊόν'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsEditModalVisible(false);
                  setSelectedProduct(null);
                }}
              >
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Όνομα</Text>
                <TextInput
                  style={styles.modalInput}
                  value={selectedProduct?.name}
                  onChangeText={(text) =>
                    setSelectedProduct({ ...selectedProduct!, name: text })
                  }
                  placeholder="Όνομα προϊόντος"
                />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Περιγραφή</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  value={selectedProduct?.description}
                  onChangeText={(text) =>
                    setSelectedProduct({ ...selectedProduct!, description: text })
                  }
                  placeholder="Περιγραφή"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Τιμή (€)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={selectedProduct?.price.toString()}
                  onChangeText={(text) =>
                    setSelectedProduct({
                      ...selectedProduct!,
                      price: parseFloat(text) || 0,
                    })
                  }
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Κατηγορία</Text>
                <TextInput
                  style={styles.modalInput}
                  value={selectedProduct?.category}
                  onChangeText={(text) =>
                    setSelectedProduct({ ...selectedProduct!, category: text })
                  }
                  placeholder="Κατηγορία"
                />
              </View>

              {selectedProduct?.id &&
                products.find((p) => p.id === selectedProduct.id) && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                      if (selectedProduct?.id) {
                        handleDelete(selectedProduct.id);
                        setIsEditModalVisible(false);
                      }
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    <Text style={styles.deleteButtonText}>Διαγραφή Προϊόντος</Text>
                  </TouchableOpacity>
                )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsEditModalVisible(false);
                  setSelectedProduct(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Ακύρωση</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  if (selectedProduct) {
                    if (products.find((p) => p.id === selectedProduct.id)) {
                      updateProduct(selectedProduct.id, selectedProduct);
                    } else {
                      // Add new product
                      if (selectedProduct.name && selectedProduct.price > 0) {
                        addProduct(selectedProduct);
                      }
                    }
                    setIsEditModalVisible(false);
                    setSelectedProduct(null);
                    Toast.show({
                      type: 'success',
                      text1: 'Αποθηκεύτηκε',
                      text2: 'Το προϊόν αποθηκεύτηκε',
                    });
                  }
                }}
              >
                <Text style={styles.saveButtonText}>Αποθήκευση</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#1F2937',
  },
  categoriesContainer: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#FF6B35',
  },
  categoryText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  productsList: {
    flex: 1,
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  unavailableBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  unavailableText: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '600',
  },
  productDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  productCategory: {
    fontSize: 12,
    color: '#9CA3AF',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  productActions: {
    justifyContent: 'center',
    marginLeft: 16,
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
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFF',
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    marginTop: 20,
  },
  deleteButtonText: {
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 8,
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
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

