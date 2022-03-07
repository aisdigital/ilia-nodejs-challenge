import { Router } from 'express';
import transactionsRouter from '@modules/transactions/infra/http/routes/transactions.router';
import balanceRouter from '@modules/transactions/infra/http/routes/balance.router';

const routes = Router();
routes.use('/transactions', transactionsRouter);
routes.use('/balance', balanceRouter);

export default routes;
