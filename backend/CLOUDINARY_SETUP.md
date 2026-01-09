# Cloudinary Setup Guide

## 1. Create Cloudinary Account

1. Go to https://cloudinary.com/users/register/free
2. Sign up for free account
3. Verify your email

## 2. Get API Credentials

After login, go to Dashboard:
- **Cloud Name**: Found in Dashboard
- **API Key**: Found in Dashboard
- **API Secret**: Found in Dashboard (click "Reveal")

## 3. Add to .env

Add these to your `backend/.env` file:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 4. Free Tier Limits

- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: Unlimited
- **Uploads**: Unlimited

## 5. Usage

### Upload Image (from mobile app):
```typescript
const result = await uploadService.uploadImage(imageUri, 'products');
// Returns: { url, publicId, width, height, format, size }
```

### Upload from URL:
```typescript
const result = await uploadService.uploadFromUrl(imageUrl, 'products');
```

### Delete Image:
```typescript
await uploadService.deleteImage(publicId);
```

## 6. Image Optimization

Cloudinary automatically:
- Optimizes image format (WebP when supported)
- Resizes images
- Compresses images
- Generates responsive URLs

## 7. Folders Structure

Images are organized in folders:
- `products/` - Product images
- `stores/` - Store/restaurant images
- `users/` - User profile images

## 8. Security

- Upload endpoint requires authentication
- Only authenticated users can upload
- File size limit: 5MB
- Only image files allowed

