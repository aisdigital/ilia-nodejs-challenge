import { v4 as uuidv4 } from 'uuid';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { TransactionDto } from '../dtos/transaction.dto';
import {
  CreateTransactionRepositoryDto,
  TransactionDto as DomainTransactionDto,
} from '../../domain/dtos/transaction.dto';

export class TransactionApplicationMapper {
  static toCreateRepositoryDto(
    dto: CreateTransactionDto,
  ): CreateTransactionRepositoryDto {
    return {
      id: uuidv4(),
      userId: dto.userId,
      amount: dto.amount,
      type: dto.type,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static toApplicationDto(transaction: DomainTransactionDto): TransactionDto {
    return {
      id: transaction.id,
      userId: transaction.userId,
      amount: transaction.amount,
      type: transaction.type,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}
