import { Router } from 'express';

import TransactionsController from '../controllers/TransactionsController';
import createTransactionValidator from '../validators/createTransactionValidator';
import findTransactionValidator from '../validators/findTransactionValidator';

const transactionsRouter = Router();

const transactionsController = new TransactionsController();

transactionsRouter.get(
  '/',
  findTransactionValidator,
  transactionsController.getAll,
);
transactionsRouter.post(
  '/',
  createTransactionValidator,
  transactionsController.create,
);

export default transactionsRouter;
