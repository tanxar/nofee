import { prisma } from '../config/database';

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

export class ProductModel {
  // Get all products
  static async findAll(filters?: {
    storeId?: string;
    category?: string;
    available?: boolean;
    featured?: boolean;
  }) {
    return prisma.product.findMany({
      where: filters,
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  // Get product by ID
  static async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        store: true,
      },
    });
  }

  // Get products by store
  static async findByStore(storeId: string, filters?: {
    category?: string;
    available?: boolean;
  }) {
    return prisma.product.findMany({
      where: {
        storeId,
        ...filters,
      },
      orderBy: [
        { featured: 'desc' },
        { category: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  // Get products by category
  static async findByCategory(category: string, storeId?: string) {
    return prisma.product.findMany({
      where: {
        category,
        ...(storeId && { storeId }),
        available: true,
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // Create product
  static async create(data: CreateProductInput) {
    return prisma.product.create({
      data: {
        storeId: data.storeId,
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        imageUrl: data.imageUrl,
        available: data.available ?? true,
        featured: data.featured ?? false,
        preparationTime: data.preparationTime,
        stock: data.stock,
        tags: data.tags || [],
      },
      include: {
        store: true,
      },
    });
  }

  // Update product
  static async update(id: string, data: UpdateProductInput) {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        store: true,
      },
    });
  }

  // Delete product
  static async delete(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  }

  // Toggle availability
  static async toggleAvailability(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { available: true },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return prisma.product.update({
      where: { id },
      data: {
        available: !product.available,
      },
    });
  }

  // Get categories
  static async getCategories(storeId?: string) {
    const products = await prisma.product.findMany({
      where: {
        ...(storeId && { storeId }),
        available: true,
      },
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    return products
      .map((p) => p.category)
      .filter((cat): cat is string => cat !== null);
  }
}

