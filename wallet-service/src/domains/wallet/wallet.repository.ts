import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../utils/prisma/prisma.service';
import { Transaction } from './entity/transaction.entity';

@Injectable()
export class WalletRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(transaction: Transaction) {
    return this.prisma.$transaction(async (tx) => {
      return tx.transaction.create({
        data: {
          user_id: transaction.user_id,
          amount: transaction.amount,
          type: transaction.type,
        },
      });
    });
  }

  async findAll(type?: 'CREDIT' | 'DEBIT') {
    return this.prisma.transaction.findMany({
      where: type ? { type } : {},
      orderBy: { created_at: 'desc' },
    });
  }

  async getBalance() {
    const result = await this.prisma.$queryRaw<{ amount: number }[]>`
      SELECT COALESCE(
        SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE -amount END),
        0
      ) AS amount
      FROM "Transaction";
    `;

    return { amount: Number(result[0].amount) };
  }
}
