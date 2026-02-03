import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { authenticate } from './middleware/authenticate';
import { validate } from './middleware/validate';
import { createTransactionSchema } from './schemas/transaction.schema';
import { TransactionController } from './controllers/TransactionController';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

const transactionController = new TransactionController();

app.get('/health', async (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

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
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Wallet Microservice running on port ${PORT}`);
});
