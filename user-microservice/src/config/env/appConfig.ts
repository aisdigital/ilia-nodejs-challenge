import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  appPort: process.env.PORT,
  jwtSecret: process.env.ILIACHALLENGE_INTERNAL,
  kafka: {
    baseUrl: process.env.KAFKA_BASE_URL,
  },
  // walletMSApi: {
  //   baseUrl: process.env.WALLET_MS_API,
  // },
}));
