import { prisma } from '../config/database';

export interface CreateStoreInput {
  merchantId: string;
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  openingHours?: any;
  minOrderAmount?: number;
  deliveryFee?: number;
  estimatedDeliveryTime?: number;
  acceptsCash?: boolean;
  acceptsCard?: boolean;
  acceptsDigital?: boolean;
}

export interface UpdateStoreInput {
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  openingHours?: any;
  minOrderAmount?: number;
  deliveryFee?: number;
  estimatedDeliveryTime?: number;
  acceptsCash?: boolean;
  acceptsCard?: boolean;
  acceptsDigital?: boolean;
  isActive?: boolean;
}

export class StoreModel {
  // Get all stores
  static async findAll(filters?: { isActive?: boolean }) {
    return prisma.store.findMany({
      where: filters,
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });
  }

  // Get store by ID
  static async findById(id: string) {
    return prisma.store.findUnique({
      where: { id },
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        products: {
          where: {
            available: true,
          },
          orderBy: [
            { featured: 'desc' },
            { category: 'asc' },
          ],
        },
      },
    });
  }

  // Get store by merchant
  static async findByMerchant(merchantId: string) {
    return prisma.store.findMany({
      where: {
        merchantId,
      },
      include: {
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });
  }

  // Create store
  static async create(data: CreateStoreInput) {
    return prisma.store.create({
      data: {
        merchantId: data.merchantId,
        name: data.name,
        description: data.description,
        phone: data.phone,
        email: data.email,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        openingHours: data.openingHours,
        minOrderAmount: data.minOrderAmount ?? 0,
        deliveryFee: data.deliveryFee ?? 0,
        estimatedDeliveryTime: data.estimatedDeliveryTime ?? 30,
        acceptsCash: data.acceptsCash ?? true,
        acceptsCard: data.acceptsCard ?? true,
        acceptsDigital: data.acceptsDigital ?? true,
      },
      include: {
        merchant: true,
      },
    });
  }

  // Update store
  static async update(id: string, data: UpdateStoreInput) {
    return prisma.store.update({
      where: { id },
      data,
      include: {
        merchant: true,
      },
    });
  }

  // Get store stats
  static async getStats(storeId: string) {
    const [orders, products, completedOrders] = await Promise.all([
      prisma.order.count({
        where: { storeId },
      }),
      prisma.product.count({
        where: { storeId },
      }),
      prisma.order.count({
        where: {
          storeId,
          status: 'completed',
        },
      }),
    ]);

    const revenue = await prisma.order.aggregate({
      where: {
        storeId,
        status: 'completed',
      },
      _sum: {
        total: true,
      },
    });

    return {
      totalOrders: orders,
      completedOrders,
      totalProducts: products,
      totalRevenue: revenue._sum.total || 0,
    };
  }
}

