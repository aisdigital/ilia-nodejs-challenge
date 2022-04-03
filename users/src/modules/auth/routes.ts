import { Router } from 'express';
import { validateLogin, validateRefresh } from './validation';
import { login, refresh } from './controller';
import { validationMiddleware } from '../../utils/error';

const router = Router();

router.post('/login', validateLogin(), validationMiddleware, login);
router.post('/refresh_token', validateRefresh(), validationMiddleware, refresh);

export default router;
