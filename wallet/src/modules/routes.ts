import { Router } from 'express';
import transactionRoute from './transaction/routes';

const router = Router();

router.use('/transaction', transactionRoute);

export default router;
