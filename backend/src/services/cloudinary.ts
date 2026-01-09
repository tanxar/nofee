import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('⚠️ Cloudinary credentials missing!');
  console.error('Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export const cloudinaryService = {
  // Upload image from buffer
  async uploadImage(
    buffer: Buffer,
    folder: string = 'nofee',
    options?: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: number;
    }
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            {
              width: options?.width || 800,
              height: options?.height || 800,
              crop: options?.crop || 'limit',
              quality: options?.quality || 'auto',
              fetch_format: 'auto',
            },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              url: result.url,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
            });
          } else {
            reject(new Error('Upload failed'));
          }
        }
      );

      // Convert buffer to stream
      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);
      stream.pipe(uploadStream);
    });
  },

  // Upload image from URL
  async uploadFromUrl(
    url: string,
    folder: string = 'nofee',
    options?: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: number;
    }
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        url,
        {
          folder,
          resource_type: 'image',
          transformation: [
            {
              width: options?.width || 800,
              height: options?.height || 800,
              crop: options?.crop || 'limit',
              quality: options?.quality || 'auto',
              fetch_format: 'auto',
            },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              url: result.url,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
            });
          } else {
            reject(new Error('Upload failed'));
          }
        }
      );
    });
  },

  // Delete image
  async deleteImage(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  },

  // Generate optimized URL
  generateOptimizedUrl(
    publicId: string,
    options?: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: number;
    }
  ): string {
    return cloudinary.url(publicId, {
      width: options?.width,
      height: options?.height,
      crop: options?.crop || 'limit',
      quality: options?.quality || 'auto',
      fetch_format: 'auto',
      secure: true,
    });
  },
};

