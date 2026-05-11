import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Parse DATABASE_URL
const url = new URL(databaseUrl);

// Create PostgreSQL connection pool
const pool = new Pool({
  host: url.hostname,
  port: parseInt(url.port || '5432'),
  database: url.pathname.slice(1),
  user: url.username,
  password: url.password,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Create adapter
const adapter = new PrismaPg(pool);

// Create a singleton instance of Prisma Client
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Connect to database
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Disconnect from database
export const disconnectDatabase = async () => {
  await prisma.$disconnect();
  await pool.end();
  console.log('📤 Database disconnected');
};
