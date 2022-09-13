import { Router } from 'express'
import { userController } from './controllers'

const router = Router()

router.route('/')
  .get(userController.list)
  .post(userController.create)

router.route('/:id').get(userController.get)
export { router as UserRoutes }