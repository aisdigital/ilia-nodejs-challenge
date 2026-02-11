import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTransactionCreateViewModel } from '../view-model/useTransactionCreateViewModel';
import { ErrorState } from '@/shared/components/feedback/ErrorState';

export function TransactionCreateForm() {
  const { state, setField, submit } = useTransactionCreateViewModel();

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6">Nova Transação</Typography>
        <TextField
          label="Valor"
          type="number"
          value={state.amount}
          onChange={(e) => setField('amount', Number(e.target.value))}
        />
        <FormControl>
          <InputLabel id="transaction-type">Tipo</InputLabel>
          <Select
            labelId="transaction-type"
            label="Tipo"
            value={state.type}
            onChange={(e) => setField('type', e.target.value as 'CREDIT' | 'DEBIT')}
          >
            <MenuItem value="CREDIT">Crédito</MenuItem>
            <MenuItem value="DEBIT">Débito</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={submit} disabled={state.loading}>
          Criar
        </Button>
        {state.error ? <ErrorState label={state.error} /> : null}
      </Stack>
    </Paper>
  );
}
