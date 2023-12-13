import { Router } from 'express';

import { ensureAuth } from '../middlewares/auth';
import {
  createTransaction,
  getBalance,
  getTransactions,
} from '../services/wallet';
import { TransactionBodySchema } from '../types/wallet';
import { badRequest } from '@hapi/boom';
import { TransactionType } from '@prisma/client';

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
  async (req, res) => {
    const { type } = req.query;
    const transactions = await getTransactions({
      user_id: req.user!.user.id,
      type: type as TransactionType,
    });

    return res.status(200).json(transactions);
  }
);
WalletController.get('/balance', ensureAuth.Authenticated, async (req, res) => {
  const balance = await getBalance(req.user!.user.id);

  return res.status(200).send({ amount: balance });
});
