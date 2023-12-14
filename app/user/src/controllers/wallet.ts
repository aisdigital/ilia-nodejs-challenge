import { Router } from 'express';
import { ensureAuth } from '../middlewares/auth';
import { TransactionBodySchema } from '../types/wallet';
import { badRequest, isBoom } from '@hapi/boom';
import { generateInternalToken } from '../services/auth';

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

      const internalToken = generateInternalToken(req.user!.user);

      const newTransaction = await fetch('http://wallet:3001/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${internalToken}`,
        },
        body: JSON.stringify({
          ...parsedTransaction.data,
        }),
      });

      return res.status(201).json(await newTransaction.json());
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
      const internalToken = generateInternalToken(req.user!.user);

      const typeQueryParam = type
        ? `?type=${encodeURIComponent(String(type))}`
        : '';

      const transactions = await fetch(
        `http://wallet:3001/transactions${typeQueryParam}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${internalToken}`,
          },
        }
      );

      return res.status(200).json(await transactions.json());
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
    const internalToken = generateInternalToken(req.user!.user);

    const balance = await fetch('http://wallet:3001/balance', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${internalToken}`,
      },
    });

    return res.status(200).send(await balance.json());
  } catch (err) {
    if (isBoom(err)) {
      return res.status(err.output.statusCode).json(err.output.payload);
    }
    return res.status(400).json(err);
  }
});
