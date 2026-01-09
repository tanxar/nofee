import { Request, Response } from 'express';
import { OrderModel } from '../models/Order';
import { z } from 'zod';
import { emitToStore } from '../config/socket';

// Validation schemas
const createOrderSchema = z.object({
  customerId: z.string().uuid().optional(),
  storeId: z.string().uuid(),
  paymentMethod: z.enum(['card', 'cash', 'digital']).optional(),
  deliveryType: z.enum(['delivery', 'pickup']).optional(),
  deliveryAddress: z.string().optional(),
  customerNotes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().uuid().optional(),
      productName: z.string().min(1),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
      notes: z.string().optional(),
    })
  ).min(1),
});

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'preparing', 'ready', 'completed', 'cancelled']),
});

export const ordersController = {
  // GET /api/orders - Get all orders
  async getAll(req: Request, res: Response) {
    try {
      const { storeId, customerId, status } = req.query;

      const filters: any = {};
      if (storeId) filters.storeId = storeId as string;
      if (customerId) filters.customerId = customerId as string;
      if (status) filters.status = status as string;

      const orders = await OrderModel.findAll(filters);
      res.json({ success: true, data: orders });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET /api/orders/:id - Get order by ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const order = await OrderModel.findById(id);

      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // POST /api/orders - Create new order
  async create(req: Request, res: Response) {
    try {
      // Validate input
      const validatedData = createOrderSchema.parse(req.body);

      const order = await OrderModel.create(validatedData);
      
      // Emit WebSocket event to store
      emitToStore(validatedData.storeId, 'new-order', order);
      
      res.status(201).json({ success: true, data: order });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // PATCH /api/orders/:id/status - Update order status
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateStatusSchema.parse(req.body);

      const order = await OrderModel.updateStatus(id, validatedData.status);
      
      // Emit WebSocket event to store
      if (order) {
        emitToStore(order.storeId, 'order-updated', order);
      }
      
      res.json({ success: true, data: order });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET /api/orders/status/:status - Get orders by status
  async getByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;
      const { storeId } = req.query;

      const orders = await OrderModel.findByStatus(
        status as any,
        storeId as string | undefined
      );
      res.json({ success: true, data: orders });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET /api/orders/store/:storeId - Get orders by store
  async getByStore(req: Request, res: Response) {
    try {
      const { storeId } = req.params;
      const { status } = req.query;

      const orders = await OrderModel.findByStore(storeId, {
        status: status as any,
      });
      res.json({ success: true, data: orders });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

