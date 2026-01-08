import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storesService, Store, Product } from '../services/storesService';

interface StoresContextType {
  stores: Store[];
  loading: boolean;
  error: string | null;
  refreshStores: () => Promise<void>;
  getStoreById: (storeId: string) => Store | undefined;
  getStoreProducts: (storeId: string) => Promise<Product[]>;
}

const StoresContext = createContext<StoresContextType | undefined>(undefined);

export function StoresProvider({ children }: { children: ReactNode }) {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stores from API
  const refreshStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedStores = await storesService.getAll();
      setStores(fetchedStores);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stores');
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    refreshStores();
  }, []);

  const getStoreById = (storeId: string) => {
    return stores.find((store) => store.id === storeId);
  };

  const getStoreProducts = async (storeId: string): Promise<Product[]> => {
    try {
      return await storesService.getProducts(storeId);
    } catch (err: any) {
      console.error('Error fetching store products:', err);
      return [];
    }
  };

  return (
    <StoresContext.Provider
      value={{
        stores,
        loading,
        error,
        refreshStores,
        getStoreById,
        getStoreProducts,
      }}
    >
      {children}
    </StoresContext.Provider>
  );
}

export function useStores() {
  const context = useContext(StoresContext);
  if (context === undefined) {
    throw new Error('useStores must be used within a StoresProvider');
  }
  return context;
}

