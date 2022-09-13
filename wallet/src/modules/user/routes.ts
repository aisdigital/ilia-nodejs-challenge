import { Router } from 'express'
import { validationMiddleware } from '../../middlewares/validationMiddleware'
import { userController } from './controllers'
import { validateCreateUser, validateLogin, validateGetUser } from './validations'
import passport from 'passport'

const router = Router()

router.route('/')
  .get(passport.authenticate('jwt', { session: false }), userController.list)
  .post(
    validateCreateUser(), 
    validationMiddleware, 
    userController.create
  )

router
  .route('/login')
  .post(
    validateLogin(),
    validationMiddleware,
    userController.login
  )

router
  .route('/:id')
  .get(
    passport.authenticate('jwt', { session: false }), 
    validateGetUser(),
    validationMiddleware,
    userController.get
  )
  
export { router as UserRoutes }