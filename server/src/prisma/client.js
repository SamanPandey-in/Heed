// Singleton Prisma client — prevents "too many connections" in dev with HMR
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis;
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = globalForPrisma.pgPool ?? new Pool({ connectionString });
const adapter = globalForPrisma.prismaAdapter ?? new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'warn', 'error']
      : ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pgPool = pool;
  globalForPrisma.prismaAdapter = adapter;
}