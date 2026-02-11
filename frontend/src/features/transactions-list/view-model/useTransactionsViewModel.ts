import { useEffect, useState } from 'react';
import { getTransactions, type TransactionItem } from '../model/transactions-list.service';

type TransactionsState = {
  items: TransactionItem[];
  loading: boolean;
  error: string | null;
};

export function useTransactionsViewModel() {
  const [state, setState] = useState<TransactionsState>({
    items: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    getTransactions()
      .then((items) => setState({ items, loading: false, error: null }))
      .catch(() =>
        setState({
          items: [],
          loading: false,
          error: 'Não foi possível carregar transações.',
        }),
      );
  }, []);

  return { state };
}
