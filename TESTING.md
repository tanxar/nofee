# 🧪 Testing Guide - NoFee Project

## 📋 Prerequisites

1. **PostgreSQL** running locally (ή cloud database)
2. **Node.js 18+** installed
3. **Expo Go** app στο κινητό (για testing mobile apps)

## 🚀 Step-by-Step Testing

### 1️⃣ Backend (Terminal 1)

```bash
cd backend

# Install dependencies (αν δεν το έχεις κάνει)
npm install

# Βεβαιώσου ότι έχεις .env file
# Αν δεν έχεις, δες backend/ENV_SETUP.md

# Run database migrations
npm run prisma:migrate

# Start backend server
npm run dev
```

**Expected output:**
```
🚀 Server running on http://localhost:3000
📊 Environment: development
✅ Database connected
```

**Test backend:**
```bash
# Health check
curl http://localhost:3000/health

# API info
curl http://localhost:3000/api
```

---

### 2️⃣ Client App (Terminal 2)

```bash
cd client

# Install dependencies (αν δεν το έχεις κάνει)
npm install

# Start Expo
npm start
```

**Options:**
- Press `i` για iOS Simulator
- Press `a` για Android Emulator
- Scan QR code με Expo Go app στο κινητό

**Test client app:**
- ✅ HomeScreen: Βλέπει stores/restaurants
- ✅ RestaurantScreen: Βλέπει products
- ✅ Cart: Προσθήκη προϊόντων
- ✅ Checkout: Place order

---

### 3️⃣ Merchant App (Terminal 3)

```bash
cd merchant

# Install dependencies (αν δεν το έχεις κάνει)
npm install

# Start Expo
npm start
```

**Options:**
- Press `i` για iOS Simulator
- Press `a` για Android Emulator
- Scan QR code με Expo Go app στο κινητό

**Test merchant app:**
- ✅ Dashboard: Βλέπει statistics
- ✅ Orders: Βλέπει παραγγελίες
- ✅ Products: Διαχείριση προϊόντων
- ✅ Update order status

---

## 🔧 Quick Start Script

Μπορείς να τρέξεις όλα μαζί με αυτό το script:

```bash
# Create test script
cat > test-all.sh << 'EOF'
#!/bin/bash

# Terminal 1: Backend
osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'/backend\" && npm run dev"'

# Terminal 2: Client
osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'/client\" && npm start"'

# Terminal 3: Merchant
osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'/merchant\" && npm start"'

echo "✅ All services starting in separate terminals"
EOF

chmod +x test-all.sh
./test-all.sh
```

---

## 🐛 Troubleshooting

### Backend δεν συνδέεται
- ✅ Έλεγξε ότι PostgreSQL τρέχει: `pg_isready`
- ✅ Έλεγξε `.env` file: `cat backend/.env`
- ✅ Test connection: `cd backend && npm run prisma:studio`

### Mobile apps δεν βλέπουν backend
- ✅ Backend τρέχει στο `http://localhost:3000`
- ✅ Σε πραγματικό device, αντικατέστησε `localhost` με το IP του υπολογιστή σου
- ✅ Edit `client/src/services/api.ts` και `merchant/src/services/api.ts`:
  ```typescript
  const API_BASE_URL = __DEV__
    ? 'http://YOUR_COMPUTER_IP:3000/api' // e.g. 'http://192.168.1.100:3000/api'
    : 'https://api.nofee.gr/api';
  ```

### Database errors
- ✅ Run migrations: `cd backend && npm run prisma:migrate`
- ✅ Reset database (αν χρειάζεται): `npm run prisma:migrate:reset`
- ✅ Open Prisma Studio: `npm run prisma:studio`

---

## 📱 Testing Flow

1. **Start Backend** → Wait for "Server running"
2. **Start Client App** → Browse restaurants
3. **Place Order** from client app
4. **Start Merchant App** → See order in Orders screen
5. **Update Order Status** in merchant app
6. **Check Order Status** in client app (αν έχεις implemented)

---

## ✅ Checklist

- [ ] Backend running on port 3000
- [ ] Database connected
- [ ] Client app running
- [ ] Merchant app running
- [ ] Can see stores in client
- [ ] Can place order from client
- [ ] Can see order in merchant
- [ ] Can update order status

---

## 🔗 Useful Commands

```bash
# Backend
cd backend
npm run dev              # Start server
npm run prisma:studio    # Open database GUI
npm run prisma:migrate   # Run migrations

# Client
cd client
npm start                # Start Expo
npm run android          # Android only
npm run ios             # iOS only

# Merchant
cd merchant
npm start               # Start Expo
npm run android         # Android only
npm run ios            # iOS only
```

