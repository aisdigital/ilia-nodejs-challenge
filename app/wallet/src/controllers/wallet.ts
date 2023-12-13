import { Router } from 'express';

import { ensureAuth } from '../middlewares/auth';
import { createTransaction } from '../services/wallet';
import { TransactionBodySchema } from '../types/wallet';
import { badRequest } from '@hapi/boom';

export const WalletController = Router();

WalletController.post(
  '/transactions',
  ensureAuth.Authenticated,
  async (req, res) => {
    const transaction = req.body;

    const parsedTransaction = TransactionBodySchema.safeParse(transaction);

    if (!parsedTransaction.success) {
      return res
        .status(400)
        .json(badRequest('Invalid transaction data', parsedTransaction.error));
    }

    const newTransaction = await createTransaction({
      ...transaction,
      userId: req.user!.user.id,
    });

    return res.status(201).json(newTransaction);
  }
);
WalletController.get(
  '/transactions',
  ensureAuth.Authenticated,
  async (req, res) => {}
);
WalletController.get(
  '/balance',
  ensureAuth.Authenticated,
  async (req, res) => {}
);
