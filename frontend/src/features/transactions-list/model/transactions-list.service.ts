import { walletApi } from '@/shared/services/api/httpClient';

export type TransactionItem = {
  id: string;
  user_id: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
};

export async function getTransactions() {
  const { data } = await walletApi.get('/transactions');
  return data as TransactionItem[];
}
