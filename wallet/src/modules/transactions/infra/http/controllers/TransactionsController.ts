import { Request, Response } from 'express';

import { container } from 'tsyringe';

import TransactionsCreator from '@modules/transactions/services/TransactionsCreator';
import TransactionsFinder from '@modules/transactions/services/TransactionsFinder';

export default class TransactionsController {
  public async getAll(request: Request, response: Response): Promise<Response> {
    const transactionsFinder = container.resolve(TransactionsFinder);

    const transactions = await transactionsFinder.execute();
    return response.json(transactions);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const { user_id, amount, type } = request.body;
    const transactionsCreator = container.resolve(TransactionsCreator);

    const transaction = await transactionsCreator.execute({
      user_id,
      amount,
      type,
    });

    return response.status(201).json(transaction);
  }
}
