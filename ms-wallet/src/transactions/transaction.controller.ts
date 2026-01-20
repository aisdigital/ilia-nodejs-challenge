import { FastifyRequest, FastifyReply } from 'fastify';
import { TransactionService } from './transaction.service';
import { TransactionRepository } from './transaction.repository';
import { CreateTransactionDTO, createTransactionSchema } from './transaction.schema';
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
}