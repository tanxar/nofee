import { prisma } from '../config/database';
import { OrderStatus, PaymentMethod, DeliveryType } from '@prisma/client';

export interface CreateOrderInput {
  customerId?: string;
  storeId: string;
  paymentMethod?: PaymentMethod;
  deliveryType?: DeliveryType;
  deliveryAddress?: string;
  customerNotes?: string;
  items: {
    productId?: string;
    productName: string;
    quantity: number;
    price: number;
    notes?: string;
  }[];
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
}

export class OrderModel {
  // Get all orders
  static async findAll(filters?: {
    storeId?: string;
    customerId?: string;
    status?: OrderStatus;
  }) {
    return prisma.order.findMany({
      where: filters,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Get order by ID
  static async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
          },
        },
      },
    });
  }

  // Get order by order number
  static async findByOrderNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        customer: true,
        store: true,
      },
    });
  }

  // Create new order
  static async create(data: CreateOrderInput) {
    // Calculate totals
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Get store for delivery fee
    const store = await prisma.store.findUnique({
      where: { id: data.storeId },
      select: { deliveryFee: true },
    });

    const deliveryFee = data.deliveryType === 'delivery' 
      ? (store?.deliveryFee || 0) 
      : 0;

    const total = subtotal + deliveryFee;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    return prisma.order.create({
      data: {
        orderNumber,
        customerId: data.customerId,
        storeId: data.storeId,
        status: 'pending',
        paymentMethod: data.paymentMethod,
        deliveryType: data.deliveryType,
        deliveryAddress: data.deliveryAddress,
        customerNotes: data.customerNotes,
        subtotal,
        deliveryFee,
        discount: 0,
        total,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes,
          })),
        },
      },
      include: {
        items: true,
        customer: true,
        store: true,
      },
    });
  }

  // Update order status
  static async updateStatus(id: string, status: OrderStatus) {
    const updateData: any = { status };

    // Set deliveredAt when status is completed
    if (status === 'completed') {
      updateData.deliveredAt = new Date();
    }

    return prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        customer: true,
        store: true,
      },
    });
  }

  // Get orders by status
  static async findByStatus(status: OrderStatus, storeId?: string) {
    return prisma.order.findMany({
      where: {
        status,
        ...(storeId && { storeId }),
      },
      include: {
        items: true,
        customer: true,
        store: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Get orders by store
  static async findByStore(storeId: string, filters?: { status?: OrderStatus }) {
    return prisma.order.findMany({
      where: {
        storeId,
        ...filters,
      },
      include: {
        items: true,
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

