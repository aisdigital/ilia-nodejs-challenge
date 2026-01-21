import { Injectable } from '@nestjs/common';
import { PrismaClient } from 'src/generated/wallet-client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaWalletService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.WALLET_DATABASE_URL as string,
    });

    super({ adapter });
  }
}
