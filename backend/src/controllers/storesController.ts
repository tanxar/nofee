import { Request, Response } from 'express';
import { StoreModel } from '../models/Store';
import { z } from 'zod';

const createStoreSchema = z.object({
  merchantId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  openingHours: z.any().optional(),
  minOrderAmount: z.number().nonnegative().optional(),
  deliveryFee: z.number().nonnegative().optional(),
  estimatedDeliveryTime: z.number().int().positive().optional(),
  acceptsCash: z.boolean().optional(),
  acceptsCard: z.boolean().optional(),
  acceptsDigital: z.boolean().optional(),
});

const updateStoreSchema = createStoreSchema.partial().extend({
  merchantId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

export const storesController = {
  // GET /api/stores - Get all stores
  async getAll(req: Request, res: Response) {
    try {
      const { isActive } = req.query;
      const filters: any = {};
      if (isActive !== undefined) {
        filters.isActive = isActive === 'true';
      }

      const stores = await StoreModel.findAll(filters);
      res.json({ success: true, data: stores });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET /api/stores/:id - Get store by ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const store = await StoreModel.findById(id);

      if (!store) {
        return res.status(404).json({ success: false, error: 'Store not found' });
      }

      res.json({ success: true, data: store });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET /api/stores/merchant/:merchantId - Get stores by merchant
  async getByMerchant(req: Request, res: Response) {
    try {
      const { merchantId } = req.params;
      const stores = await StoreModel.findByMerchant(merchantId);
      res.json({ success: true, data: stores });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET /api/stores/:id/stats - Get store statistics
  async getStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const stats = await StoreModel.getStats(id);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // POST /api/stores - Create store
  async create(req: Request, res: Response) {
    try {
      const validatedData = createStoreSchema.parse(req.body);
      const store = await StoreModel.create(validatedData);
      res.status(201).json({ success: true, data: store });
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

  // PATCH /api/stores/:id - Update store
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateStoreSchema.parse(req.body);

      const store = await StoreModel.update(id, validatedData);
      res.json({ success: true, data: store });
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
};

