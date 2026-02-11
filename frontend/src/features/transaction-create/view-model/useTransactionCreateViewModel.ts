import { useState } from 'react';
import { createTransaction, type TransactionPayload } from '../model/transaction-create.service';

type CreateState = {
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  loading: boolean;
  error: string | null;
};

const initialState: CreateState = {
  amount: 0,
  type: 'CREDIT',
  loading: false,
  error: null,
};

export function useTransactionCreateViewModel() {
  const [state, setState] = useState<CreateState>(initialState);

  const setField = (field: keyof CreateState, value: string | number) => {
    setState((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const payload: TransactionPayload = {
        amount: Number(state.amount),
        type: state.type,
      };
      await createTransaction(payload);
      setState((prev) => ({ ...prev, loading: false }));
    } catch {
      setState((prev) => ({ ...prev, loading: false, error: 'Falha ao criar transação.' }));
    }
  };

  return { state, setField, submit };
}
