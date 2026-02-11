import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { useTransactionsViewModel } from '../view-model/useTransactionsViewModel';

export function TransactionsTable() {
  const { state } = useTransactionsViewModel();

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Transações
      </Typography>

      {state.loading ? <LoadingState /> : null}
      {state.error ? <ErrorState label={state.error} /> : null}
      {!state.loading && !state.error && state.items.length === 0 ? <EmptyState /> : null}

      {!state.loading && !state.error && state.items.length > 0 ? (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tipo</TableCell>
              <TableCell>Valor</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {state.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.type}</TableCell>
                <TableCell>R$ {item.amount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </Paper>
  );
}
