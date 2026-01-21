import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaWalletService } from './prismaWallet.service';

@Module({
  providers: [PrismaService, PrismaWalletService],
  exports: [PrismaService, PrismaWalletService],
})
export class PrismaModule {}
