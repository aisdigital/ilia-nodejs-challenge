import { FastifyInstance } from 'fastify';
import { TransactionController } from '../controllers/TransactionController';
import { CreateTransaction } from '../../application/use-cases/CreateTransaction';
import { ListTransactions } from '../../application/use-cases/ListTransactions';
import { GetBalance } from '../../application/use-cases/GetBalance';
import { TransactionRepository } from '../../infrastructure/repositories/TransactionRepository';

export default async function transactionRoutes(app: FastifyInstance) {
  const transactionRepository = new TransactionRepository();
  const createTransactionUseCase = new CreateTransaction(transactionRepository);
  const listTransactionsUseCase = new ListTransactions(transactionRepository);
  const getBalanceUseCase = new GetBalance(transactionRepository);
  
  const controller = new TransactionController(
    createTransactionUseCase,
    listTransactionsUseCase,
    getBalanceUseCase
  );

  app.post('/transactions', { preHandler: [app.authenticate] }, controller.create.bind(controller));

  app.get('/transactions', { preHandler: [app.authenticate] }, controller.list.bind(controller));

  app.get('/balance', { preHandler: [app.authenticate] }, controller.getBalance.bind(controller));
}
