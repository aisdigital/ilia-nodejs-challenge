import { walletApi } from '@/shared/services/api/httpClient';

export async function getWalletBalance() {
  const { data } = await walletApi.get('/balance');
  return data as { amount: number };
}
