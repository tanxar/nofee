import { Router } from 'express';
import { storesController } from '../controllers/storesController';

const router = Router();

// Get stores by merchant
router.get('/merchant/:merchantId', storesController.getByMerchant);

// Get store statistics
router.get('/:id/stats', storesController.getStats);

// Get all stores
router.get('/', storesController.getAll);

// Get store by ID
router.get('/:id', storesController.getById);

// Create store
router.post('/', storesController.create);

// Update store
router.patch('/:id', storesController.update);

export default router;

