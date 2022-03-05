import { Router } from 'express';

import TransactionsController from '../controllers/TransactionsController';
import createTransactionValidator from '../validators/createTransactionValidator';

const transactionsRouter = Router();

const transactionsController = new TransactionsController();

transactionsRouter.get('/', transactionsController.getAll);
transactionsRouter.post(
  '/',
  createTransactionValidator,
  transactionsController.create,
);

export default transactionsRouter;
