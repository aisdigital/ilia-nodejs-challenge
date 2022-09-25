import express from 'express';
import transactionsController from './controllers/transaction';

const router = express.Router();

// transaction routes
router.post('/transaction', transactionsController.create);
router.get('/transaction', transactionsController.list);

// balance routes
// router.post('/balance', transactionsController);

export default router;