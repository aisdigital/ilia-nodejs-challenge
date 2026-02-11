import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { AppLayout } from '@/app/layouts/AppLayout';
import { useAuthViewModel } from '@/features/auth/view-model/useAuthViewModel';

export function LoginPage() {
  const { state, setEmail, setPassword, submit } = useAuthViewModel();

  return (
    <AppLayout>
      <Stack spacing={2} maxWidth={420}>
        <Typography variant="h4">Login</Typography>
        <TextField label="Email" value={state.email} onChange={(e) => setEmail(e.target.value)} />
        <TextField
          label="Senha"
          type="password"
          value={state.password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button variant="contained" onClick={submit} disabled={state.loading}>
          Entrar
        </Button>
        {state.error ? (
          <Box color="error.main" role="alert">
            {state.error}
          </Box>
        ) : null}
      </Stack>
    </AppLayout>
  );
}
