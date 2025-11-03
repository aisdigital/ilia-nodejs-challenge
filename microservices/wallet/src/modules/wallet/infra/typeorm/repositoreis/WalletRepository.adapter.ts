/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity } from '../entities/Transaction.entity';
import {
  BalanceResult,
  IWalletRepository,
} from '../../../domain/repositories/IWalletRepository';
import {
  Transaction,
  TransactionType,
} from '../../../domain/entities/Transaction';

@Injectable()
export class WalletRepositoryAdapter implements IWalletRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly repository: Repository<TransactionEntity>,
  ) {}

  private mapToDomain(entity: TransactionEntity): Transaction {
    const transactionOrError = Transaction.create(
      {
        userId: entity.userId,
        amount: entity.amount,
        type: entity.type,
        createdAt: entity.createdAt,
      },
      entity.id,
    );

    if (transactionOrError instanceof Error) {
      throw new Error('Database integrity error: Invalid amount stored.');
    }
    return transactionOrError;
  }

  async save(transaction: Transaction): Promise<void> {
    const entity = this.repository.create({
      id: transaction.id,
      userId: transaction.userId,
      amount: transaction.amount,
      type: transaction.type,
      createdAt: transaction.createdAt,
    });
    await this.repository.save(entity);
  }

  async findTransactionsByUserId(
    userId: string,
    type?: TransactionType,
  ): Promise<Transaction[]> {
    const where: any = { userId };
    if (type) {
      where.type = type;
    }

    const entities = await this.repository.find({
      where,
      order: { createdAt: 'DESC' },
    });
    return entities.map(this.mapToDomain);
  }

  async getBalanceByUserId(userId: string): Promise<BalanceResult> {
    const result = await this.repository
      .createQueryBuilder('t')
      .select(
        'SUM(CASE WHEN t.type = :credit THEN t.amount ELSE -t.amount END)',
        'amount',
      )
      .where('t.user_id = :userId', { userId, credit: TransactionType.CREDIT })
      .getRawOne();

    return { amount: parseFloat(result.amount) || 0 };
  }
}
