# NoFee Backend API

Backend API για το NoFee platform.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Local PostgreSQL

#### Option A: Docker (Recommended)
```bash
docker run --name nofee-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=nofee \
  -p 5432:5432 \
  -d postgres:15
```

#### Option B: Local PostgreSQL Installation
Αν έχεις PostgreSQL εγκατεστημένο:
```bash
createdb nofee
```

### 3. Environment Variables
```bash
cp .env.example .env
# Edit .env with your DATABASE_URL
```

The `.env` file should have:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nofee?schema=public"
```

### 4. Setup Prisma

#### Generate Prisma Client
```bash
npm run prisma:generate
```

#### Run Database Migrations
```bash
npm run prisma:migrate
```

This will:
- Create all tables in your database
- Generate TypeScript types
- Create migration files

### 5. Start Development Server
```bash
npm run dev
```

Server θα τρέχει στο `http://localhost:3000`

### 6. (Optional) Open Prisma Studio
```bash
npm run prisma:studio
```

Opens a visual database browser at `http://localhost:5555`

## Database Configuration

### Localhost (Development)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nofee?schema=public"
```

### Production (Supabase/Railway)
```env
DATABASE_URL="postgresql://postgres:your-password@your-host.supabase.co:5432/postgres?schema=public&sslmode=require"
```

Απλά αλλάζεις το `DATABASE_URL` - το code μένει το ίδιο!

### Prisma Schema
The database schema is defined in `prisma/schema.prisma`. 
Edit this file to change the database structure, then run:
```bash
npm run prisma:migrate
```

## API Endpoints

### Health Check
```
GET /health
```

### API Info
```
GET /api
```

### Available Endpoints

- **Orders**: `/api/orders`
  - GET `/api/orders` - Get all orders
  - GET `/api/orders/:id` - Get order by ID
  - GET `/api/orders/status/:status` - Get orders by status
  - GET `/api/orders/store/:storeId` - Get orders by store
  - POST `/api/orders` - Create new order
  - PATCH `/api/orders/:id/status` - Update order status

- **Products**: `/api/products`
  - GET `/api/products` - Get all products
  - GET `/api/products/:id` - Get product by ID
  - GET `/api/products/store/:storeId` - Get products by store
  - GET `/api/products/category/:category` - Get products by category
  - GET `/api/products/categories` - Get all categories
  - POST `/api/products` - Create product
  - PATCH `/api/products/:id` - Update product
  - PATCH `/api/products/:id/toggle` - Toggle availability
  - DELETE `/api/products/:id` - Delete product

- **Stores**: `/api/stores`
  - GET `/api/stores` - Get all stores
  - GET `/api/stores/:id` - Get store by ID
  - GET `/api/stores/merchant/:merchantId` - Get stores by merchant
  - GET `/api/stores/:id/stats` - Get store statistics
  - POST `/api/stores` - Create store
  - PATCH `/api/stores/:id` - Update store

For detailed API documentation, see [API_DOCS.md](API_DOCS.md)

## Project Structure

```
backend/
├── src/
│   ├── config/        # Database, environment config
│   ├── controllers/   # Business logic
│   ├── models/        # Data models
│   ├── routes/        # API routes
│   ├── middleware/    # Auth, validation, etc.
│   └── utils/         # Helper functions
├── migrations/        # SQL migration files
├── dist/             # Compiled JavaScript
└── package.json
```

## Development

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Migration to Cloud PostgreSQL

Όταν είσαι έτοιμος να μεταφέρεις σε cloud:

1. **Create Supabase/Railway PostgreSQL database**
2. **Get connection string**
3. **Update .env file:**
   ```env
   DATABASE_URL="postgresql://postgres:password@host:5432/dbname?schema=public&sslmode=require"
   ```
4. **Run migrations on cloud database:**
   ```bash
   npm run prisma:migrate:deploy
   ```
5. **Done!** Το app θα συνδεθεί αυτόματα

Prisma will handle all the connection details from the DATABASE_URL!

## Prisma Commands

```bash
# Generate Prisma Client (after schema changes)
npm run prisma:generate

# Create and apply migration
npm run prisma:migrate

# Apply migrations in production
npm run prisma:migrate:deploy

# Open Prisma Studio (visual database browser)
npm run prisma:studio
```

## Using Prisma in Code

```typescript
import { prisma } from './config/database';

// Example: Get all orders
const orders = await prisma.order.findMany({
  where: { status: 'pending' },
  include: { 
    items: true,
    customer: true,
    store: true
  }
});

// Example: Create order
const order = await prisma.order.create({
  data: {
    orderNumber: 'ORD-001',
    storeId: 'store-id',
    status: 'pending',
    total: 25.50,
    items: {
      create: [
        { productName: 'Burger', quantity: 2, price: 12.50 }
      ]
    }
  }
});
```

## Next Steps

- [ ] Authentication endpoints
- [ ] Orders CRUD
- [ ] Products CRUD
- [ ] Real-time updates (WebSockets)

