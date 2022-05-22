import { Amount } from '@/interfaces/balance.interface';

export function mapAmount(transaction: Amount): Amount {
  return {
    amount: Number(transaction.amount),
  } as Amount;
}
