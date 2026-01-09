import { Request, Response } from 'express';
import { AuthModel, registerSchema, loginSchema } from '../models/Auth';

export const authController = {
  // POST /api/auth/register
  async register(req: Request, res: Response) {
    try {
      // Validate input
      const validatedData = registerSchema.parse(req.body);

      // Register user
      const result = await AuthModel.register(validatedData);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }

      res.status(400).json({
        success: false,
        error: error.message || 'Registration failed',
      });
    }
  },

  // POST /api/auth/login
  async login(req: Request, res: Response) {
    try {
      // Validate input
      const validatedData = loginSchema.parse(req.body);

      // Login user
      const result = await AuthModel.login(validatedData);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }

      res.status(401).json({
        success: false,
        error: error.message || 'Login failed',
      });
    }
  },

  // GET /api/auth/me - Get current user
  async getMe(req: Request, res: Response) {
    try {
      const userId = (req as any).userId; // Set by auth middleware

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const user = await AuthModel.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get user',
      });
    }
  },
};

