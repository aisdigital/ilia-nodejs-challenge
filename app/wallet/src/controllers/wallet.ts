import { Router } from 'express';

import { ensureAuth } from '../middlewares/auth';

export const WalletController = Router();

WalletController.post(
  '/transactions',
  ensureAuth.Authenticated,
  async (req, res) => {}
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
