import { Alert } from '@mui/material';

export function ErrorState({ label = 'Algo deu errado.' }: { label?: string }) {
  return <Alert severity="error">{label}</Alert>;
}
