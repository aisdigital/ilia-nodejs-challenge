import { Router } from 'express'
import { TransactionRoutes } from './transaction/routes'
import { UserRoutes } from './user/routes'

const router = Router()

router.use('/users', UserRoutes)
router.use('/transactions', TransactionRoutes)

export { router }