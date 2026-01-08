import { api } from './api';

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
  available: boolean;
  featured: boolean;
  preparationTime?: number;
  stock?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  storeId: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
  available?: boolean;
  featured?: boolean;
  preparationTime?: number;
  stock?: number;
  tags?: string[];
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  imageUrl?: string;
  available?: boolean;
  featured?: boolean;
  preparationTime?: number;
  stock?: number;
  tags?: string[];
}

export const productsService = {
  // Get all products
  async getAll(filters?: {
    storeId?: string;
    category?: string;
    available?: boolean;
    featured?: boolean;
  }): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters?.storeId) params.append('storeId', filters.storeId);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.available !== undefined) params.append('available', String(filters.available));
    if (filters?.featured !== undefined) params.append('featured', String(filters.featured));

    const query = params.toString();
    const endpoint = query ? `/products?${query}` : '/products';
    const response = await api.get<Product[]>(endpoint);
    return response.data || [];
  },

  // Get product by ID
  async getById(productId: string): Promise<Product | null> {
    const response = await api.get<Product>(`/products/${productId}`);
    return response.data || null;
  },

  // Get products by store
  async getByStore(storeId: string, filters?: {
    category?: string;
    available?: boolean;
  }): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.available !== undefined) params.append('available', String(filters.available));

    const query = params.toString();
    const endpoint = query
      ? `/products/store/${storeId}?${query}`
      : `/products/store/${storeId}`;
    const response = await api.get<Product[]>(endpoint);
    return response.data || [];
  },

  // Get products by category
  async getByCategory(category: string, storeId?: string): Promise<Product[]> {
    const endpoint = storeId
      ? `/products/category/${category}?storeId=${storeId}`
      : `/products/category/${category}`;
    const response = await api.get<Product[]>(endpoint);
    return response.data || [];
  },

  // Get all categories
  async getCategories(storeId?: string): Promise<string[]> {
    const endpoint = storeId
      ? `/products/categories?storeId=${storeId}`
      : '/products/categories';
    const response = await api.get<string[]>(endpoint);
    return response.data || [];
  },

  // Create product
  async create(productData: CreateProductInput): Promise<Product | null> {
    const response = await api.post<Product>('/products', productData);
    return response.data || null;
  },

  // Update product
  async update(productId: string, updates: UpdateProductInput): Promise<Product | null> {
    const response = await api.patch<Product>(`/products/${productId}`, updates);
    return response.data || null;
  },

  // Delete product
  async delete(productId: string): Promise<boolean> {
    const response = await api.delete(`/products/${productId}`);
    return response.success;
  },

  // Toggle availability
  async toggleAvailability(productId: string): Promise<Product | null> {
    const response = await api.patch<Product>(`/products/${productId}/toggle`);
    return response.data || null;
  },
};

