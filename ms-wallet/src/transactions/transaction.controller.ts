import { FastifyRequest, FastifyReply } from 'fastify';
import { TransactionService } from './transaction.service';
import { TransactionRepository } from './transaction.repository';
import { 
  CreateTransactionDTO, 
  createTransactionSchema,
  ListTransactionsQueryDTO,
  listTransactionsQuerySchema 
} from './transaction.schema';
import { ValidationError } from '../shared/errors/app-error';

export class TransactionController {
  private service: TransactionService;

  constructor() {
    const repository = new TransactionRepository();
    this.service = new TransactionService(repository);
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const validationResult = createTransactionSchema.safeParse(request.body);
      
      if (!validationResult.success) {
        throw new ValidationError(validationResult.error.message);
      }

      const data: CreateTransactionDTO = validationResult.data;

      const transaction = await this.service.create(data);

      reply.status(201).send(transaction);
    } catch (error) {
      throw error;
    }
  }

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // TODO: Get user_id from JWT token when ms-users is ready
      const userId = (request.query as any).user_id;
      
      if (!userId) {
        throw new ValidationError('user_id is required');
      }

      const validationResult = listTransactionsQuerySchema.safeParse(request.query);
      
      if (!validationResult.success) {
        throw new ValidationError(validationResult.error.message);
      }

      const query: ListTransactionsQueryDTO = validationResult.data;
      const transactions = await this.service.list(userId, query);

      reply.status(200).send(transactions);
    } catch (error) {
      throw error;
    }
  }

  async getBalance(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // TODO: Get user_id from JWT token when ms-users is ready
      const userId = (request.query as any).user_id;
      
      if (!userId) {
        throw new ValidationError('user_id is required');
      }

      const balance = await this.service.getBalance(userId);

      reply.status(200).send(balance);
    } catch (error) {
      throw error;
    }
  }
}