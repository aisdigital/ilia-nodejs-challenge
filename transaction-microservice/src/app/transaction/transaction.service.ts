import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { CreateTransactionDto } from './dto/createTransaction.dto';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(data: CreateTransactionDto): Promise<Transaction> {
    const createdTransaction = await this.prismaService.transaction.create({
      data,
    });

    return createdTransaction;
  }

  consolidateBalance(transactions: Array<Transaction>, type: string) {
    let amount = 0.0;
    for (const transaction of transactions) {
      amount += Number(transaction.amount);
    }

    if (amount === 0) {
      amount = 0;
    }

    return {
      type,
      amount,
    };
  }

  async getBalance() {
    const debitBalance = await this.prismaService.transaction.findMany({
      where: {
        type: 'DEBIT',
      },
    });

    const consolidatedDebitBalance = this.consolidateBalance(
      debitBalance,
      'DEBIT',
    );

    const creditBalance = await this.prismaService.transaction.findMany({
      where: {
        type: 'CREDIT',
      },
    });

    const consolidatedCreditBalance = this.consolidateBalance(
      creditBalance,
      'CREDIT',
    );

    return { consolidatedDebitBalance, consolidatedCreditBalance };
  }
}
