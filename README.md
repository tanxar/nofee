# NoFee - Food Delivery Platform

A comprehensive food delivery platform monorepo with separate apps for consumers, merchants, and a backend API.

## 📁 Project Structure

```
.
├── client/          # Consumer mobile app (React Native/Expo)
├── merchant/        # Merchant mobile app (React Native/Expo)
└── backend/         # Backend API (Node.js/Express/Prisma/PostgreSQL)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL (local or cloud)
- Expo CLI (for mobile apps)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

### Client App Setup

1. Navigate to client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the app:
   ```bash
   npm start
   ```

### Merchant App Setup

1. Navigate to merchant directory:
   ```bash
   cd merchant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the app:
   ```bash
   npm start
   ```

## 📱 Features

### Client App
- Browse restaurants and menus
- Add items to cart
- Place orders
- Track favorites
- User profile

### Merchant App
- Dashboard with statistics
- Order management
- Product management
- Analytics
- Settings and promotions

### Backend API
- RESTful API for orders, products, and stores
- PostgreSQL database with Prisma ORM
- JWT authentication (to be implemented)
- Real-time order updates (to be implemented)

## 🛠️ Tech Stack

### Mobile Apps
- React Native
- Expo
- TypeScript
- React Navigation
- Context API

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod (validation)

## 📝 API Documentation

See [backend/API_DOCS.md](./backend/API_DOCS.md) for detailed API documentation.

## 🔧 Development

### Running All Services

From the root directory:

```bash
# Install all dependencies
npm run install:all

# Start backend
cd backend && npm run dev

# Start client app (in new terminal)
cd client && npm start

# Start merchant app (in new terminal)
cd merchant && npm start
```

## 📄 License

Private project
