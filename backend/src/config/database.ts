import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Prisma Client instance
// This will be used throughout the app for database operations
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

// Test database connection
export async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database via Prisma');
    
    // Test query
    const result = await prisma.$queryRaw`SELECT NOW() as now`;
    console.log('✅ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function disconnectDatabase() {
  await prisma.$disconnect();
  console.log('✅ Disconnected from database');
}

// Handle app termination
process.on('beforeExit', async () => {
  await disconnectDatabase();
});

export default prisma;
