import { Box, Stack, Typography } from '@mui/material';
import { AppLayout } from '@/app/layouts/AppLayout';
import { WalletBalanceCard } from '@/features/wallet-balance/view/WalletBalanceCard';
import { TransactionCreateForm } from '@/features/transaction-create/view/TransactionCreateForm';
import { TransactionsTable } from '@/features/transactions-list/view/TransactionsTable';

export function DashboardPage() {
  return (
    <AppLayout>
      <Stack spacing={3}>
        <Typography variant="h4">Dashboard</Typography>
        <WalletBalanceCard />
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              md: '5fr 7fr',
            },
          }}
        >
          <Box>
            <TransactionCreateForm />
          </Box>
          <Box>
            <TransactionsTable />
          </Box>
        </Box>
      </Stack>
    </AppLayout>
  );
}
