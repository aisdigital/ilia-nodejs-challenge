import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material';
import { PropsWithChildren } from 'react';

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">FinTech Wallet</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  );
}
