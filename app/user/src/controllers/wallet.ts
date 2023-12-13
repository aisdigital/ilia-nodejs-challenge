import { Router } from 'express';
import { ensureAuth } from '../middlewares/auth';
import { TransactionBodySchema } from '../types/wallet';
import { badRequest } from '@hapi/boom';
import { generateInternalToken } from '../services/auth';

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

    const internalToken = generateInternalToken(req.user!.user);

    const newTransaction = await fetch('http://localhost:3001/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${internalToken}`,
      },
      body: JSON.stringify({ ...transaction, user_id: req.user!.user.id }),
    });

    return res.status(201).json(newTransaction);
  }
);
WalletController.get(
  '/transactions',
  ensureAuth.Authenticated,
  async (req, res) => {
    const { type } = req.query;
    const internalToken = generateInternalToken(req.user!.user);

    const transactions = await fetch(
      `http://localhost:3001/transactions&type=${type}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${internalToken}`,
        },
      }
    );

    return res.status(200).json(transactions);
  }
);
WalletController.get('/balance', ensureAuth.Authenticated, async (req, res) => {
  const internalToken = generateInternalToken(req.user!.user);

  const balance = await fetch('http://localhost:3001/balance', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${internalToken}`,
    },
  });

  return res.status(200).send({ amount: balance });
});
