import { Router } from 'express';
import TransactionsController from '../controllers/transactions.controller';
import AuthMiddleware from '../middlewares/auth.middleware';

const transactionsRouter = Router();
const transactionsController = new TransactionsController();
const authMiddleware = new AuthMiddleware();

transactionsRouter.get('/transactions', authMiddleware.verifyJWT, transactionsController.get)
transactionsRouter.post('/transactions', authMiddleware.verifyJWT, transactionsController.create)

export default transactionsRouter;