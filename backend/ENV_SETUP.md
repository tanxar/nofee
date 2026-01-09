# Environment Variables Setup

## Create .env file

Copy this content to a `.env` file in the backend folder:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database URL (Prisma format)
# For Localhost PostgreSQL:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nofee?schema=public"

# For Production (Supabase/Railway) - uncomment and fill when ready:
# DATABASE_URL="postgresql://postgres:your-password@your-host.supabase.co:5432/postgres?schema=public&sslmode=require"

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:19006

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## DATABASE_URL Format

### Localhost:
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public
```

Example:
```
postgresql://postgres:postgres@localhost:5432/nofee?schema=public
```

### Cloud (Supabase/Railway):
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public&sslmode=require
```

Example:
```
postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres?schema=public&sslmode=require
```

## After creating .env

1. Install dependencies: `npm install`
2. Generate Prisma Client: `npm run prisma:generate`
3. Run migrations: `npm run prisma:migrate`
4. Start server: `npm run dev`

