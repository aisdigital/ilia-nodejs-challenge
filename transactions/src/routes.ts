import express from 'express';
import transactionsController from './controllers/transaction';
import userController from './controllers/users';
import balanceController from './controllers/balance';

const router = express.Router();

// user routes
router.post('/user', userController.userCreate);

// transaction routes
router.post('/transaction', transactionsController.createTransaction);
router.get('/transaction/:id', transactionsController.getTransactions);

// balance routes
router.get('/balance/:id', balanceController.getBalance);

export default router;