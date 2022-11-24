import { Router } from 'express';
import AuthController from '../controllers/auth.controller';

const usersRouter = Router();
const authController = new AuthController();

usersRouter.post('/auth', authController.auth)

export default usersRouter;