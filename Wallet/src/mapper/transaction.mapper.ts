import { Transactions } from '@/interfaces/transactions.interface';

export function mapTransaction(transaction: Transactions): Transactions {
  return {
    user_id: transaction.user_id,
    amount: transaction.amount,
    type: transaction.type,
  } as Transactions;
}
