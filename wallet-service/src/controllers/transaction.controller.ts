import { Request, Response } from 'express';
import { TransactionService } from '../services/transaction.service';
import { CreateTransactionInput } from '../schemas/transaction.schema';
import { TRANSACTION_TYPE_VALUES, TRANSACTION_ERRORS } from '../constants/transaction.constants';

export class TransactionController {
  private service: TransactionService;

  constructor() {
    this.service = new TransactionService();
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = req.body as CreateTransactionInput;
      const userId = validatedData.user_id;

      if (!userId) {
        res.status(400).json({ error: TRANSACTION_ERRORS.MISSING_USER_ID });
        return;
      }

      const transaction = await this.service.createTransaction(userId, validatedData);
      res.status(201).json(transaction);
    } catch (error:any) {
      if (error instanceof Error && error.message.includes('exceeds maximum')) {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: TRANSACTION_ERRORS.FAILED_TO_CREATE, internalMessage: error.message });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.user_id as string | undefined;
      const typeFilter = req.query.type as string | undefined;

      if (!userId) {
        res.status(400).json({ error: TRANSACTION_ERRORS.MISSING_USER_ID_QUERY });
        return;
      }

      if (typeFilter && !TRANSACTION_TYPE_VALUES.includes(typeFilter as any)) {
        res.status(400).json({ error: TRANSACTION_ERRORS.INVALID_TYPE });
        return;
      }

      const transactions = await this.service.listTransactions(userId, typeFilter);
      res.status(200).json({ transactions });
    } catch (error) {
      res.status(500).json({ error: TRANSACTION_ERRORS.FAILED_TO_LIST });
    }
  }

  async getBalance(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.user_id as string | undefined;

      if (!userId) {
        res.status(400).json({ error: TRANSACTION_ERRORS.MISSING_USER_ID_QUERY });
        return;
      }

      const balance = await this.service.calculateBalance(userId);

      res.status(200).json(balance);
    } catch (error) {
      res.status(500).json({ error: TRANSACTION_ERRORS.FAILED_TO_CALCULATE });
    }
  }
}
