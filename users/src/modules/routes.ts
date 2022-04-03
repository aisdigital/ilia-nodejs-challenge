import { Router } from 'express';
import userRoute from './user/routes';
import authRoute from './auth/routes';

const router = Router();

router.use('/auth', authRoute);
router.use('/users', userRoute);

export default router;
