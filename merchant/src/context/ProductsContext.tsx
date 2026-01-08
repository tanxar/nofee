import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CreateProductInput, UpdateProductInput } from '../services/productsService';
import { productsService } from '../services/productsService';
import Toast from 'react-native-toast-message';

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  addProduct: (product: CreateProductInput) => Promise<void>;
  updateProduct: (productId: string, updates: UpdateProductInput) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  toggleProductAvailability: (productId: string) => Promise<void>;
  getProductById: (productId: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
  // Store ID for filtering
  storeId?: string;
  setStoreId: (id: string) => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | undefined>(undefined);

  // Fetch products from API
  const refreshProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedProducts = storeId
        ? await productsService.getByStore(storeId)
        : await productsService.getAll();
      setProducts(fetchedProducts);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    refreshProducts();
  }, [storeId]);

  // Add product via API
  const addProduct = async (productData: CreateProductInput) => {
    try {
      const newProduct = await productsService.create(productData);
      if (newProduct) {
        setProducts((prev) => [...prev, newProduct]);
        Toast.show({
          type: 'success',
          text1: 'Προστέθηκε',
          text2: 'Το προϊόν προστέθηκε επιτυχώς',
        });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Σφάλμα',
        text2: err.message || 'Αποτυχία προσθήκης προϊόντος',
      });
      throw err;
    }
  };

  // Update product via API
  const updateProduct = async (productId: string, updates: UpdateProductInput) => {
    try {
      const updatedProduct = await productsService.update(productId, updates);
      if (updatedProduct) {
        setProducts((prev) =>
          prev.map((product) =>
            product.id === productId ? updatedProduct : product
          )
        );
        Toast.show({
          type: 'success',
          text1: 'Ενημερώθηκε',
          text2: 'Το προϊόν ενημερώθηκε επιτυχώς',
        });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Σφάλμα',
        text2: err.message || 'Αποτυχία ενημέρωσης προϊόντος',
      });
      throw err;
    }
  };

  // Delete product via API
  const deleteProduct = async (productId: string) => {
    try {
      const success = await productsService.delete(productId);
      if (success) {
        setProducts((prev) => prev.filter((product) => product.id !== productId));
        Toast.show({
          type: 'success',
          text1: 'Διαγράφηκε',
          text2: 'Το προϊόν διαγράφηκε επιτυχώς',
        });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Σφάλμα',
        text2: err.message || 'Αποτυχία διαγραφής προϊόντος',
      });
      throw err;
    }
  };

  // Toggle availability via API
  const toggleProductAvailability = async (productId: string) => {
    try {
      const updatedProduct = await productsService.toggleAvailability(productId);
      if (updatedProduct) {
        setProducts((prev) =>
          prev.map((product) =>
            product.id === productId ? updatedProduct : product
          )
        );
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Σφάλμα',
        text2: err.message || 'Αποτυχία ενημέρωσης διαθεσιμότητας',
      });
      throw err;
    }
  };

  const getProductById = (productId: string) => {
    return products.find((product) => product.id === productId);
  };

  const getProductsByCategory = (category: string) => {
    return products.filter((product) => product.category === category);
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        error,
        refreshProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductAvailability,
        getProductById,
        getProductsByCategory,
        storeId,
        setStoreId,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}
