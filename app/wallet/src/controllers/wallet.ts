import { Router } from 'express';

import { ensureAuth } from '../middlewares/auth';
import {
  createTransaction,
  getBalance,
  getTransactions,
} from '../services/wallet';
import { TransactionBodySchema } from '../types/wallet';
import { badRequest, isBoom } from '@hapi/boom';
import { TransactionType } from '@prisma/client';

export const WalletController = Router();

WalletController.post(
  '/transactions',
  ensureAuth.Authenticated,
  async (req, res) => {
    try {
      const transaction = req.body;

      const parsedTransaction = TransactionBodySchema.safeParse(transaction);

      if (!parsedTransaction.success) {
        return res
          .status(400)
          .json(
            badRequest('Invalid transaction data', parsedTransaction.error)
          );
      }

      const newTransaction = await createTransaction({
        ...transaction,
        user_id: req.user!.user.id,
      });

      return res.status(201).json(newTransaction);
    } catch (err) {
      if (isBoom(err)) {
        return res.status(err.output.statusCode).json(err.output.payload);
      }
      return res.status(400).json(err);
    }
  }
);
WalletController.get(
  '/transactions',
  ensureAuth.Authenticated,
  async (req, res) => {
    try {
      const { type } = req.query;

      const transactions = await getTransactions({
        user_id: req.user!.user.id,
        type: type as TransactionType,
      });

      return res.status(200).json(transactions);
    } catch (err) {
      if (isBoom(err)) {
        return res.status(err.output.statusCode).json(err.output.payload);
      }
      return res.status(400).json(err);
    }
  }
);
WalletController.get('/balance', ensureAuth.Authenticated, async (req, res) => {
  try {
    const balance = await getBalance(req.user!.user.id);

    return res.status(200).send({ amount: balance });
  } catch (err) {
    if (isBoom(err)) {
      return res.status(err.output.statusCode).json(err.output.payload);
    }
    return res.status(400).json(err);
  }
});
