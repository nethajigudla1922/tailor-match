import { PrismaClient } from '@prisma/client';
import path from 'path';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Resolve absolute path to SQLite file relative to process.cwd() for Vercel serverless functions
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const databaseUrl = `file:${dbPath}`;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    },
    log: ['query']
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
