import { CircularProgress, Stack, Typography } from '@mui/material';

export function LoadingState({ label = 'Carregando...' }: { label?: string }) {
  return (
    <Stack alignItems="center" spacing={1} py={2}>
      <CircularProgress size={24} />
      <Typography variant="body2">{label}</Typography>
    </Stack>
  );
}
