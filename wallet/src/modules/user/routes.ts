import { Router } from 'express'
import { validationMiddleware } from '../../middlewares/validationMiddleware'
import { userController } from './controllers'
import { validateCreateUser, validateGetUser } from './validations'

const router = Router()

router.route('/')
  .get(userController.list)
  .post(validateCreateUser(), validationMiddleware, userController.create)

router.route('/:id').get(validateGetUser(), validationMiddleware, userController.get)
export { router as UserRoutes }