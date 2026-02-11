import { Card, CardContent, Typography } from '@mui/material';
import { useWalletBalanceViewModel } from '../view-model/useWalletBalanceViewModel';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { LoadingState } from '@/shared/components/feedback/LoadingState';

export function WalletBalanceCard() {
  const { state } = useWalletBalanceViewModel();

  return (
    <Card>
      <CardContent>
        <Typography variant="overline">Saldo Atual</Typography>
        {state.loading ? <LoadingState /> : null}
        {state.error ? <ErrorState label={state.error} /> : null}
        {!state.loading && !state.error ? (
          <Typography variant="h4">R$ {state.amount.toFixed(2)}</Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}
