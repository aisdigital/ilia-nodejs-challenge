import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateTransaction } from '../../application/use-cases/CreateTransaction';
import { ListTransactions } from '../../application/use-cases/ListTransactions';
import { GetBalance } from '../../application/use-cases/GetBalance';
import { TransactionType } from '../../domain/entities/Transaction';

export class TransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransaction,
    private readonly listTransactionsUseCase: ListTransactions,
    private readonly getBalanceUseCase: GetBalance
  ) {}
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { amount, type } = request.body as { amount: number; type: TransactionType };
      const userId = request.user.id;

      const transaction = await this.createTransactionUseCase.execute({
        userId,
        amount,
        type,
      });

      return reply.code(200).send({
        id: transaction.id,
        user_id: transaction.userId,
        amount: transaction.amount,
        type: transaction.type,
      });
    } catch (error) {
      if (error instanceof Error) {
        return reply.code(400).send({ error: error.message });
      }
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { type } = request.query as { type?: TransactionType };
      const userId = request.user.id;

      const transactions = await this.listTransactionsUseCase.execute({
        userId,
        type,
      });

      return reply.code(200).send(
        transactions.map((t) => ({
          id: t.id,
          user_id: t.userId,
          amount: t.amount,
          type: t.type,
        }))
      );
    } catch (error) {
      if (error instanceof Error) {
        return reply.code(400).send({ error: error.message });
      }
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }

  async getBalance(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.id;

      const result = await this.getBalanceUseCase.execute({ userId });

      return reply.code(200).send({ amount: result.amount });
    } catch (error) {
      if (error instanceof Error) {
        return reply.code(400).send({ error: error.message });
      }
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }
}
