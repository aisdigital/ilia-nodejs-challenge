import { Router } from 'express'
import { validationMiddleware } from '../../middlewares/validationMiddleware'
import { transactionController } from './controllers'
import { validateCreateTransaction } from './validations'
import passport from 'passport'

const router = Router()

router.route('/')
  .post(
    passport.authenticate('jwt', { session: false }), 
    validateCreateTransaction(), 
    validationMiddleware, 
    transactionController.create
  )

export { router as TransactionRoutes }