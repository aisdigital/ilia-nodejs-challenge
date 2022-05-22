import { NextFunction, Request, Response } from 'express';
import TransactionsService from '@/services/transactions.service';
import { CreateTransactionDto } from '@/dtos/transactions.dto';
import { Transactions } from '@/interfaces/transactions.interface';
import { mapTransaction } from '@/mapper/transaction.mapper';

class TransactionsController {
  public transactionsService = new TransactionsService();

  public getTransactionByType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const type = req.query.type as string;
      const transactions: Transactions[] = await this.transactionsService.findTransactionByType(type);

      res.status(200).json(transactions.map(mapTransaction));
    } catch (error) {
      next(error);
    }
  };

  public createTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transactionData: CreateTransactionDto = req.body;
      const createUserData: Transactions = await this.transactionsService.createTransaction(transactionData);

      res.status(201).json(mapTransaction(createUserData));
    } catch (error) {
      next(error);
    }
  };
}

export default TransactionsController;
