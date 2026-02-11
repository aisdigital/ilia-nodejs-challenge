import { Stack, Typography } from '@mui/material';

export function EmptyState({ label = 'Nenhum dado encontrado.' }: { label?: string }) {
  return (
    <Stack alignItems="center" py={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}
