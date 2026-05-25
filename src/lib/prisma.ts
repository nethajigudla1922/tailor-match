import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let databaseUrl: string;

if (process.env.NODE_ENV === 'production') {
  // On Vercel serverless, copy read-only database from bundle to writeable /tmp folder
  const bundleDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  const writableDbPath = path.join('/tmp', 'dev.db');

  try {
    if (!fs.existsSync(writableDbPath)) {
      console.log('Configuring writable SQLite database in /tmp');
      fs.copyFileSync(bundleDbPath, writableDbPath);
      fs.chmodSync(writableDbPath, 0o666);
    }
    databaseUrl = `file:${writableDbPath}`;
  } catch (error) {
    console.error('Failed to copy writable SQLite database, falling back to bundle:', error);
    databaseUrl = `file:${bundleDbPath}`;
  }
} else {
  // Local development
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  databaseUrl = `file:${dbPath}`;
}

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
