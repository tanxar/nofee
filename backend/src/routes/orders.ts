import { Router } from 'express';
import { ordersController } from '../controllers/ordersController';

const router = Router();

// Get all orders (with optional filters)
router.get('/', ordersController.getAll);

// Get orders by status
router.get('/status/:status', ordersController.getByStatus);

// Get orders by store
router.get('/store/:storeId', ordersController.getByStore);

// Get order by ID
router.get('/:id', ordersController.getById);

// Create new order
router.post('/', ordersController.create);

// Update order status
router.patch('/:id/status', ordersController.updateStatus);

export default router;

