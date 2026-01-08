import { Router } from 'express';
import { productsController } from '../controllers/productsController';

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

// Create product
router.post('/', productsController.create);

// Update product
router.patch('/:id', productsController.update);

// Toggle product availability
router.patch('/:id/toggle', productsController.toggleAvailability);

// Delete product
router.delete('/:id', productsController.delete);

export default router;

