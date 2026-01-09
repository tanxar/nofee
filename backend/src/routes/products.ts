import { Router } from 'express';
import { productsController } from '../controllers/productsController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Get all categories
router.get('/categories', productsController.getCategories);

// Get products by category
router.get('/category/:category', productsController.getByCategory);

// Get products by store
router.get('/store/:storeId', productsController.getByStore);

// Get all products (with optional filters)
router.get('/', productsController.getAll);

// Get product by ID
router.get('/:id', productsController.getById);

// Create product (merchant only)
router.post('/', authenticate, requireRole(['merchant']), productsController.create);

// Update product (merchant only)
router.patch('/:id', authenticate, requireRole(['merchant']), productsController.update);

// Toggle product availability (merchant only)
router.patch('/:id/toggle', authenticate, requireRole(['merchant']), productsController.toggleAvailability);

// Delete product (merchant only)
router.delete('/:id', authenticate, requireRole(['merchant']), productsController.delete);

export default router;

