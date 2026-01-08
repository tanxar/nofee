import { Request, Response } from 'express';
import { ProductModel } from '../models/Product';
import { z } from 'zod';

// Validation schemas
const createProductSchema = z.object({
  storeId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  category: z.string().optional(),
  imageUrl: z.string().url().optional(),
  available: z.boolean().optional(),
  featured: z.boolean().optional(),
  preparationTime: z.number().int().positive().optional(),
  stock: z.number().int().optional(),
  tags: z.array(z.string()).optional(),
});

const updateProductSchema = createProductSchema.partial().extend({
  storeId: z.string().uuid().optional(),
});

export const productsController = {
  // GET /api/products - Get all products
  async getAll(req: Request, res: Response) {
    try {
      const { storeId, category, available, featured } = req.query;

      const filters: any = {};
      if (storeId) filters.storeId = storeId as string;
      if (category) filters.category = category as string;
      if (available !== undefined) filters.available = available === 'true';
      if (featured !== undefined) filters.featured = featured === 'true';

      const products = await ProductModel.findAll(filters);
      res.json({ success: true, data: products });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET /api/products/:id - Get product by ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await ProductModel.findById(id);

      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }

      res.json({ success: true, data: product });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET /api/products/store/:storeId - Get products by store
  async getByStore(req: Request, res: Response) {
    try {
      const { storeId } = req.params;
      const { category, available } = req.query;

      const products = await ProductModel.findByStore(storeId, {
        category: category as string | undefined,
        available: available === 'true' ? true : available === 'false' ? false : undefined,
      });
      res.json({ success: true, data: products });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET /api/products/category/:category - Get products by category
  async getByCategory(req: Request, res: Response) {
    try {
      const { category } = req.params;
      const { storeId } = req.query;

      const products = await ProductModel.findByCategory(
        category,
        storeId as string | undefined
      );
      res.json({ success: true, data: products });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET /api/products/categories - Get all categories
  async getCategories(req: Request, res: Response) {
    try {
      const { storeId } = req.query;
      const categories = await ProductModel.getCategories(storeId as string | undefined);
      res.json({ success: true, data: categories });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // POST /api/products - Create product
  async create(req: Request, res: Response) {
    try {
      const validatedData = createProductSchema.parse(req.body);
      const product = await ProductModel.create(validatedData);
      res.status(201).json({ success: true, data: product });
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

  // PATCH /api/products/:id - Update product
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateProductSchema.parse(req.body);

      const product = await ProductModel.update(id, validatedData);
      res.json({ success: true, data: product });
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

  // DELETE /api/products/:id - Delete product
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await ProductModel.delete(id);
      res.json({ success: true, message: 'Product deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // PATCH /api/products/:id/toggle - Toggle availability
  async toggleAvailability(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await ProductModel.toggleAvailability(id);
      res.json({ success: true, data: product });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

