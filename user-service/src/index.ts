import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { validate } from './middleware/validate';
import { authenticate, AuthenticatedRequest } from './middleware/authenticate';
import { registerSchema, loginSchema } from './schemas/auth.schema';
import { UserController } from './controllers/UserController';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

const userController = new UserController();

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post(
  '/auth/register',
  validate(registerSchema),
  (req: Request, res: Response) => userController.register(req, res)
);

app.post(
  '/auth/login',
  validate(loginSchema),
  (req: Request, res: Response) => userController.login(req, res)
);

app.get(
  '/users/me',
  authenticate,
  (req: AuthenticatedRequest, res: Response) => userController.getMe(req, res)
);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`User Microservice running on port ${PORT}`);
});


