import express from 'express';
import transactionsController from './controllers/transaction';

const router = express.Router();

// user routes
router.post('/user', transactionsController.userCreate);

// transaction routes
router.post('/transaction', transactionsController.createBalance);
router.get('/transaction', transactionsController.getTransactions);

// balance routes
router.get('/balance', transactionsController.getBalance);

export default router;