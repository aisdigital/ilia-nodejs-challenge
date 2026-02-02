import { PrismaClient } from '@prisma/client';

// Create a single instance of Prisma Client to be reused across the application
const prisma = new PrismaClient();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
