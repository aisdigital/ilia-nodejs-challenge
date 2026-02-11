import { useEffect, useState } from 'react';
import { getWalletBalance } from '../model/wallet-balance.service';

type BalanceState = {
  amount: number;
  loading: boolean;
  error: string | null;
};

export function useWalletBalanceViewModel() {
  const [state, setState] = useState<BalanceState>({
    amount: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    getWalletBalance()
      .then((response) => {
        setState({ amount: response.amount, loading: false, error: null });
      })
      .catch(() => {
        setState({ amount: 0, loading: false, error: 'Não foi possível carregar saldo.' });
      });
  }, []);

  return { state };
}
