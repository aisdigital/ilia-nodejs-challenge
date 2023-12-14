import { Router } from 'express';
import { WalletController } from './controllers/wallet';

export const router = Router();

router.use('/', WalletController);
