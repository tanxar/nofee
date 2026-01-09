import { Router } from 'express';
import { uploadController } from '../controllers/uploadController';
import { uploadSingle } from '../middleware/upload';
import { authenticate } from '../middleware/auth';

const router = Router();

// Upload single image (requires authentication)
router.post('/image', authenticate, uploadSingle, uploadController.uploadImage);

// Upload from URL (requires authentication)
router.post('/url', authenticate, uploadController.uploadFromUrl);

// Delete image (requires authentication)
router.delete('/:publicId', authenticate, uploadController.deleteImage);

export default router;

