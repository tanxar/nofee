# NoFee Monorepo

Monorepo για τα NoFee apps.

## Structure

```
nofee client]/
├── client/          # Consumer app
├── merchant/        # Merchant app
├── backend/         # Backend API (Node.js + PostgreSQL)
└── package.json     # Root package.json
```

## Setup

```bash
npm run install:all
```

## Run Apps

### Client App
```bash
npm run client:start
# ή
cd client && npm start
```

### Merchant App
```bash
npm run merchant:start
# ή
cd merchant && npm start
```

## Backend API

```bash
cd backend
npm install
npm run dev
```

Server θα τρέχει στο `http://localhost:3000`

Για database setup, δες το [backend/README.md](backend/README.md)

## Development

Κάθε app έχει το δικό του `package.json` και dependencies. Μπορείς να δουλεύεις σε κάθε ένα ξεχωριστά.

