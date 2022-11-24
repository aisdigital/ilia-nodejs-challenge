import { Router } from 'express';
import usersRouter  from './users.router'
import authRouter  from './auth.router'

const router = Router();
router.use(usersRouter);
router.use(authRouter);

export default router;