import { Router } from 'express';
import TransactionsController from '../controllers/transactions.controller';

const transactionsRouter = Router();
const transactionsController = new TransactionsController();

transactionsRouter.get('/transactions', transactionsController.get)
transactionsRouter.post('/transactions', transactionsController.create)

export default transactionsRouter;