import { validationMiddleware } from '../../utils/error';
import { Router } from 'express';
import { createTransaction, listTransactions, getBalace } from './controller';
import { validateCreateTransaction, validateListTransactions } from './validation';
import passport from 'passport';

const router = Router();

router
  .route('/transactions')
  .post(
    passport.authenticate('jwt', { session: false }),
    validateCreateTransaction(),
    validationMiddleware,
    createTransaction,
  )
  .get(
    passport.authenticate('jwt', { session: false }),
    validateListTransactions(),
    validationMiddleware,
    listTransactions,
  );

router
  .route('/balance')
  .get(passport.authenticate('jwt', { session: false }), validationMiddleware, getBalace);
export default router;
