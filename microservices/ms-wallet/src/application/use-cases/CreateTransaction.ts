import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { Transaction, TransactionType } from '../../domain/entities/Transaction';
import { userGrpcClient } from '../../infrastructure/grpc/userGrpcClient';
import { InsufficientBalanceError } from '../../domain/errors/InsufficientBalanceError';

export interface CreateTransactionInput {
    userId: string;
    amount: number;
    type: TransactionType;
}

export class CreateTransaction {
    constructor(private transactionRepository: ITransactionRepository) { }

    async execute(input: CreateTransactionInput): Promise<Transaction> {
        if (input.amount <= 0) {
            throw new Error('Amount must be greater than zero');
        }

        if (!Object.values(TransactionType).includes(input.type)) {
            throw new Error('Invalid transaction type');
        }

        const validation = await userGrpcClient.validateUser(input.userId);
        if (!validation.valid) {
            throw new Error(validation.error || 'Invalid user');
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
