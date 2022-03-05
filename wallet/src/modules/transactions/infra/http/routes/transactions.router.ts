import { Router } from 'express';

import TransactionsController from '../controllers/TransactionsController';

const transactionsRouter = Router();

const transactionsController = new TransactionsController();

transactionsRouter.get('/', transactionsController.getAll);
transactionsRouter.post('/', transactionsController.create);

export default transactionsRouter;
