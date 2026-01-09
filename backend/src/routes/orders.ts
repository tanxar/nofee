import { Router } from 'express';
import { ordersController } from '../controllers/ordersController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Get all orders (with optional filters)
router.get('/', ordersController.getAll);

// Get orders by status
router.get('/status/:status', ordersController.getByStatus);

// Get orders by store
router.get('/store/:storeId', ordersController.getByStore);

// Get order by ID
router.get('/:id', ordersController.getById);

// Create new order (customer only)
router.post('/', authenticate, requireRole(['customer']), ordersController.create);

// Update order status (merchant only)
router.patch('/:id/status', authenticate, requireRole(['merchant']), ordersController.updateStatus);

export default router;

