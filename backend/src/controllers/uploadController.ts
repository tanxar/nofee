import { Request, Response } from 'express';
import { cloudinaryService } from '../services/cloudinary';

export const uploadController = {
  // POST /api/upload/image - Upload single image
  async uploadImage(req: Request, res: Response) {
    try {
      console.log('📤 Upload request received');
      console.log('File:', req.file ? `Yes (${req.file.size} bytes, ${req.file.mimetype})` : 'No');
      console.log('Body:', req.body);
      console.log('Cloudinary config:', {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
        api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
        api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing',
      });

      if (!req.file) {
        console.error('❌ No file in request');
        return res.status(400).json({
          success: false,
          error: 'No image file provided',
        });
      }

      const folder = (req.body.folder as string) || 'nofee';
      const width = req.body.width ? parseInt(req.body.width) : undefined;
      const height = req.body.height ? parseInt(req.body.height) : undefined;

      console.log(`📁 Uploading to folder: ${folder}, size: ${width}x${height}`);

      const result = await cloudinaryService.uploadImage(req.file.buffer, folder, {
        width,
        height,
        crop: 'limit',
        quality: 'auto',
      });

      console.log('✅ Upload successful:', result.secure_url);
      console.log('📋 Public ID:', result.public_id);
      console.log('📁 Folder:', folder);
      console.log('🔗 Direct URL:', result.secure_url);
      console.log('📊 Image details:', {
        width: result.width,
        height: result.height,
        format: result.format,
        size: `${(result.bytes / 1024).toFixed(2)} KB`,
      });

      res.json({
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes,
        },
      });
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to upload image',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  },

  // POST /api/upload/url - Upload from URL
  async uploadFromUrl(req: Request, res: Response) {
    try {
      const { url, folder, width, height } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'URL is required',
        });
      }

      const result = await cloudinaryService.uploadFromUrl(url, folder || 'nofee', {
        width: width ? parseInt(width) : undefined,
        height: height ? parseInt(height) : undefined,
        crop: 'limit',
        quality: 'auto',
      });

      res.json({
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes,
        },
      });
    } catch (error: any) {
      console.error('Upload from URL error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to upload image from URL',
      });
    }
  },

  // DELETE /api/upload/:publicId - Delete image
  async deleteImage(req: Request, res: Response) {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          error: 'Public ID is required',
        });
      }

      await cloudinaryService.deleteImage(publicId);

      res.json({
        success: true,
        message: 'Image deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete image error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete image',
      });
    }
  },
};

