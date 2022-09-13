import { Router } from 'express'
import { UserRoutes } from './user/routes'
import { TransactionRoutes } from './transaction/routes'

const router = Router()

router.use('/users', UserRoutes)
router.use('/transactions', TransactionRoutes)

export { router }