import {
  CreateTransactionRepositoryDto,
  TransactionDto,
  TransactionType,
} from '../dtos/transaction.dto';

export interface TransactionRepositoryInterface {
  create(data: CreateTransactionRepositoryDto): Promise<TransactionDto>;
  findById(id: string): Promise<TransactionDto | null>;
  findByUserId(userId: string, type?: TransactionType): Promise<TransactionDto[]>;
  findAll(type?: TransactionType): Promise<TransactionDto[]>;
  getBalance(userId: string): Promise<number>;
}

export const TRANSACTION_REPOSITORY = Symbol('TRANSACTION_REPOSITORY');
