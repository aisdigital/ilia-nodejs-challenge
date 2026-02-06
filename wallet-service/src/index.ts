import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { authenticate } from './middleware/authenticate';
import { validate } from './middleware/validate';
import { createTransactionSchema } from './schemas/transaction.schema';
import { createWalletUserSchema } from './schemas/wallet-user.schema';
import { TransactionController } from './controllers/transaction.controller';
import { WalletUserController } from './controllers/wallet-user.controller';
import { loggingMiddleware, logger } from './lib/logger';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(loggingMiddleware);

const transactionController = new TransactionController();
const walletUserController = new WalletUserController();

app.get('/health', async (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post(
  '/wallet/users',
  authenticate,
  validate(createWalletUserSchema),
  (req: Request, res: Response) => walletUserController.createUser(req, res)
);

app.post(
  '/transactions',
  authenticate,
  validate(createTransactionSchema),
  (req: Request, res: Response) => transactionController.create(req, res)
);

app.get(
  '/transactions',
  authenticate,
  (req: Request, res: Response) => transactionController.list(req, res)
);

app.get(
  '/balance',
  authenticate,
  (req: Request, res: Response) => transactionController.getBalance(req, res)
);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ error: err.message, stack: err.stack }, 'Unhandled error');
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  logger.info(`Wallet Microservice running on port ${PORT}`);
});
