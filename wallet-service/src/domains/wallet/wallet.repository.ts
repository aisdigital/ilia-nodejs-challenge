import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../utils/prisma/prisma.service';
import { Transaction } from './entity/transaction.entity';
import { Prisma } from '@prisma/wallet-client';

@Injectable()
export class WalletRepository {
  constructor(private readonly prisma: PrismaService) {}

  async runTransaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(async (tx) => fn(tx));
  }

  async createTransaction(
    tx: Prisma.TransactionClient,
    transaction: Transaction,
  ) {
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

  findWallet(tx: Prisma.TransactionClient, userId: number) {
    return this.prisma.wallet.findUnique({
      where: { user_id: userId },
    });
  }

  async getBalance(userId: number) {
    const result = await this.prisma.$queryRaw<{ amount: number }[]>`
     SELECT
  COALESCE(
    SUM(
      CASE
        WHEN type = 'CREDIT' THEN amount
        ELSE - amount
      END
    ),
    0
  ) AS amount
FROM
  "Transaction"
WHERE
  user_id = ${userId};
    `;

    return { amount: Number(result[0].amount) };
  }

  async updateBalance(
    tx: Prisma.TransactionClient,
    userId: number,
    balance: number,
  ) {
    return tx.wallet.update({
      where: { user_id: userId },
      data: { balance },
    });
  }
}
