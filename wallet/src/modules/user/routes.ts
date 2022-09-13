import { Router } from 'express'
import { userController } from './controllers'

const router = Router()

router.route('/')
  .get(userController.list)
  .post(userController.create)

export { router as UserRoutes }