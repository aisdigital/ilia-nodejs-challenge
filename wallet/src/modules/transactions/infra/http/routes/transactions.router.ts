import { Router } from 'express';

import ensureAuthenticated from '@modules/auth/infra/http/middleware/ensureAuthenticated';
import TransactionsController from '../controllers/TransactionsController';
import createTransactionValidator from '../validators/createTransactionValidator';
import findTransactionValidator from '../validators/findTransactionValidator';

const transactionsRouter = Router();

const transactionsController = new TransactionsController();

transactionsRouter.use(ensureAuthenticated);
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
