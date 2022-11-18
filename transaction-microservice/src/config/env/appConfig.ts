import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  appPort: process.env.PORT,
  jwtSecret: process.env.ILIACHALLENGE_INTERNAL,
  transactionMSApi: {
    baseUrl: process.env.TRANSACTION_MS_API,
  },
}));
