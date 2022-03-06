import ensureAuthenticated from '@modules/auth/infra/http/middleware/ensureAuthenticated';
import { Router } from 'express';

import BalanceController from '../controllers/BalanceController';

const balanceRouter = Router();
balanceRouter.use(ensureAuthenticated);

const balanceController = new BalanceController();

balanceRouter.get('/', balanceController.getBalance);

export default balanceRouter;
