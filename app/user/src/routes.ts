import { Router } from 'express';
import { login } from './services/auth';
import { UserController } from './controllers/user';

export const router = Router();

router.post('/auth', async (req, res) => {
  const { email, password } = req.body;
  const user = await login({ email, password });
  res.status(200).json(user);
});

router.use('/users', UserController);
