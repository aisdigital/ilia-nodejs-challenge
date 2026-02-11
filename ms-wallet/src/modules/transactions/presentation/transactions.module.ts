import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TransactionsController } from './transactions.controller';
import { JwtStrategy } from '../../../shared/auth/jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_EXTERNAL_SECRET ?? 'ILIACHALLENGE',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [TransactionsController],
  providers: [JwtStrategy],
})
export class TransactionsModule {}
