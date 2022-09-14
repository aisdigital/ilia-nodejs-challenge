import { Router } from 'express'
import { validationMiddleware } from '../../middlewares/validationMiddleware'
import { transactionController } from './controllers'
import { validateCreateTransaction, validateGetTransaction, validateListTransactions } from './validations'
import passport from 'passport'

const router = Router()

router.route('/')
  .get(
    passport.authenticate('jwt', { session: false }),
    validateListTransactions(),
    validationMiddleware,
    transactionController.list
  )
  .post(
    passport.authenticate('jwt', { session: false }), 
    validateCreateTransaction(), 
    validationMiddleware, 
    transactionController.create
  )

router.route('/:id')
  .get(
    passport.authenticate('jwt', { session: false }), 
    validateGetTransaction(),
    validationMiddleware,
    transactionController.get
  )
  
export { router as TransactionRoutes }