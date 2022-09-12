import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logger } from 'winston';
import {
  ITransactionBalanceResponse,
  ITransactionResponse,
} from './interfaces/transactions.interfaces';
import { TransactionModel } from './model/transaction.model';

@Injectable()
export class TransactionService {
  private loggerString = `[${TransactionService.name}]`;
  constructor(
    @Inject('winston') private readonly logger: Logger,
    @InjectModel('TransactionModel')
    private readonly transactionModel: Model<TransactionModel>,
  ) {}

  async save(transaction): Promise<ITransactionResponse> {
    try {
      const transactionSaved = new this.transactionModel(transaction);

      return await transactionSaved.save();
    } catch (err) {
      this.logger.error(`Error: ${err}`);

      return null;
    }
  }

  async getAll(): Promise<Array<ITransactionResponse>> {
    try {
      const transactions = await this.transactionModel.find();

      return transactions;
    } catch (err) {
      this.logger.error(`Error: ${err}`);

      return null;
    }
  }

  async getByUser(id): Promise<Array<ITransactionResponse>> {
    try {
      const transactions = await this.transactionModel
        .find({ user_id: id })
        .exec();

      return transactions;
    } catch (err) {
      this.logger.error(`Error: ${err}`);

      return null;
    }
  }

  async getTransactionBalance(user_id): Promise<ITransactionBalanceResponse> {
    try {
      const balance = (await this.transactionModel
        .find({
          user_id: user_id.user_id,
        })
        .select({ amount: 1, _id: 0 })) as any;

      const consolidateBalance = balance.reduce(
        (total, number) => total + number.amount,
        0,
      );

      return { amount: consolidateBalance };
    } catch (err) {
      this.logger.error(`Error: ${err}`);

      return null;
    }
  }
}
