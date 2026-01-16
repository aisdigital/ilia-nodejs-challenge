import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { Transaction, TransactionType } from '../../domain/entities/Transaction';
import { userGrpcClient } from '../../infrastructure/grpc/userGrpcClient';
import {
  InsufficientBalanceError,
  InvalidAmountError,
  InvalidTransactionTypeError,
  UserNotFoundError,
} from '../../domain/errors';

export interface CreateTransactionInput {
  userId: string;
  amount: number;
  type: TransactionType;
}

export class CreateTransaction {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(input: CreateTransactionInput): Promise<Transaction> {
    if (input.amount <= 0) {
      throw new InvalidAmountError();
    }

    if (!Object.values(TransactionType).includes(input.type)) {
      throw new InvalidTransactionTypeError();
    }

    const validation = await userGrpcClient.validateUser(input.userId);
    if (!validation.valid) {
      throw new UserNotFoundError(validation.error || 'User not found');
    }

    if (input.type === TransactionType.DEBIT) {
      const currentBalance = await this.transactionRepository.calculateBalance(input.userId);
      if (currentBalance < input.amount) {
        throw new InsufficientBalanceError();
      }
    }

    const transaction = await this.transactionRepository.create({
      userId: input.userId,
      amount: input.amount,
      type: input.type,
    });

    return transaction;
  }
}
