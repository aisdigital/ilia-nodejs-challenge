import { walletApi } from '@/shared/services/api/httpClient';

export type TransactionPayload = {
  amount: number;
  type: 'CREDIT' | 'DEBIT';
};

export async function createTransaction(payload: TransactionPayload) {
  const { data } = await walletApi.post('/transactions', payload);
  return data;
}
