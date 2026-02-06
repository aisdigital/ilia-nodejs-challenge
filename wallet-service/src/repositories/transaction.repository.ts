import prisma from '../lib/prisma';

interface CreateTransactionInput {
  userId: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
}

export class TransactionRepository {
  async create(data: CreateTransactionInput) {
    return prisma.transaction.create({
      data,
    });
  }

  async findByUser(userId: string, typeFilter?: string) {
    const where: any = { userId };

    if (typeFilter) {
      where.type = typeFilter;
    }

    return prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getGroupedByType(userId: string) {
    return prisma.transaction.groupBy({
      by: ['type'],
      where: { userId },
      _sum: { amount: true },
    });
  }
}
