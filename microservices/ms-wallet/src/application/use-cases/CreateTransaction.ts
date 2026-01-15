import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { Transaction, TransactionType } from '../../domain/entities/Transaction';

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

        const transaction = await this.transactionRepository.create({
            userId: input.userId,
            amount: input.amount,
            type: input.type,
        });

        return transaction;
    }
}
