import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logger } from 'winston';
import { ITransactionResponse } from './interfaces/transactions.interfaces';
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
    } catch (err) {}
  }

  async getAll(): Promise<Array<ITransactionResponse>> {
    try {
      const transactions = this.transactionModel.find().exec();

      return transactions;
    } catch (err) {}
  }

  async getByUser(id): Promise<Array<ITransactionResponse>> {
    try {
      const transactions = this.transactionModel.find({ user_id: id }).exec();

      return transactions;
    } catch (err) {}
  }
}
