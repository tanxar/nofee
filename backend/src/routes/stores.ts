import { Router } from 'express';
import { storesController } from '../controllers/storesController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Get stores by merchant
router.get('/merchant/:merchantId', storesController.getByMerchant);

// Get store statistics
router.get('/:id/stats', storesController.getStats);

// Get all stores
router.get('/', storesController.getAll);

// Get store by ID
router.get('/:id', storesController.getById);

// Create store (merchant only)
router.post('/', authenticate, requireRole(['merchant']), storesController.create);

// Update store (merchant only)
router.patch('/:id', authenticate, requireRole(['merchant']), storesController.update);

export default router;

