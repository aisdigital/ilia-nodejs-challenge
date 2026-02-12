import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TransactionSchema } from 'src/shared/database/schemas/transaction.schema';
import { CreateTransactionDto } from 'src/shared/@types/User';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel('Transaction')
    private readonly transactionModel: Model<typeof TransactionSchema>,
  ) {}

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    const { userId, amount, type } = createTransactionDto;

    const transaction = await this.transactionModel.create({
      user_id: userId,
      amount,
      type,
    });

    return transaction.save();
  }

  async findAllTransactionsByUserId(userId: string) {
    const transactions = await this.transactionModel
      .find()
      .where({ user_id: userId })
      .exec();

    return transactions;
  }

  async getUserBalance(userId: string) {
    const [result] = await this.transactionModel.aggregate([
      { $match: { user_id: userId } },
      {
        $group: {
          _id: null,
          balance: {
            $sum: {
              $cond: [
                { $eq: ['$type', 'credit'] }, // boolean expression
                '$amount', // true case
                { $multiply: ['$amount', -1] }, // false case
              ],
            },
          },
        },
      },
    ]);

    const { balance } = result;

    return {
      amount: balance || 0,
    };
  }
}
