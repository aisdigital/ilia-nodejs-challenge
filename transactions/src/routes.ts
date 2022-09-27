import express from 'express';
import transactionsController from './controllers/transaction';
import userController from './controllers/users';
import balanceController from './controllers/balance';
import middlewares from './middlewares/middlewares'

const router = express.Router();

//auth route
router.post('/auth', userController.login);

// user routes
router.post('/user', userController.userCreate);
router.get('/user', middlewares.verifyJWT, userController.usersGet);

// transaction routes
router.post('/transaction', middlewares.verifyJWT, transactionsController.createTransaction);
router.get('/transaction/:id', middlewares.verifyJWT, transactionsController.getTransactions);

// balance routes
router.get('/balance/:id', middlewares.verifyJWT, balanceController.getBalance);

export default router;