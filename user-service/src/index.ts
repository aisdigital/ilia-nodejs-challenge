import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { validate } from './middleware/validate';
import { authenticate, AuthenticatedRequest } from './middleware/authenticate';
import { registerSchema, loginSchema } from './schemas/auth.schema';
import { UserController } from './controllers/user.controller';
import { loggingMiddleware, logger } from './lib/logger';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(loggingMiddleware);

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

app.post(
  '/users/me/transactions',
  authenticate,
  (req: AuthenticatedRequest, res: Response) => userController.createTransaction(req, res)
);

app.get(
  '/users/me/transactions',
  authenticate,
  (req: AuthenticatedRequest, res: Response) => userController.getTransactions(req, res)
);

app.get(
  '/users/me/balance',
  authenticate,
  (req: AuthenticatedRequest, res: Response) => userController.getBalance(req, res)
);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ error: err.message, stack: err.stack }, 'Unhandled error');
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  logger.info(`User Microservice running on port ${PORT}`);
});


