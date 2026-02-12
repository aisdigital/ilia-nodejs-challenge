import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ITransactionRepository } from '../../../core/domain/repositories/transaction.repository.interface';
import { TransactionEntity } from '../../../core/domain/entities/transaction.entity';
import { TransactionType } from '../../../core/domain/enum/transaction-type.enum';
import {
  Transaction,
  TransactionDocument,
} from '../mongodb/schemas/transaction.schema';

@Injectable()
export class TransactionRepository implements ITransactionRepository {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  async create(transaction: TransactionEntity): Promise<TransactionEntity> {
    const createdTransaction = new this.transactionModel({
      user_id: transaction.user_id,
      amount: transaction.amount,
      type: transaction.type,
    });

    const saved = await createdTransaction.save();
    return this.toDomain(saved);
  }

  async findByUserId(
    userId: string,
    type?: TransactionType,
  ): Promise<TransactionEntity[]> {
    const filter: any = { user_id: userId };

    if (type) {
      filter.type = type;
    }

    const transactions = await this.transactionModel
      .find(filter)
      .sort({ createdAt: -1 })
      .exec();

    return transactions.map((t) => this.toDomain(t));
  }

  async calculateBalance(userId: string): Promise<number> {
    const result = await this.transactionModel.aggregate([
      { $match: { user_id: userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let credits = 0;
    let debits = 0;

    result.forEach((item) => {
      if (item._id === TransactionType.CREDIT) {
        credits = item.total;
      } else if (item._id === TransactionType.DEBIT) {
        debits = item.total;
      }
    });

    return credits - debits;
  }

  private toDomain(transaction: TransactionDocument): TransactionEntity {
    return new TransactionEntity({
      id: transaction._id.toString(),
      user_id: transaction.user_id,
      amount: transaction.amount,
      type: transaction.type,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    });
  }
}