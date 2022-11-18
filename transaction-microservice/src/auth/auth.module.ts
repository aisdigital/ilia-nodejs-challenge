import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { JwtStrategy } from './strategies/jwt.strategy';
import { NestModule } from '@nestjs/common';
import { MiddlewareConsumer } from '@nestjs/common';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.ILIACHALLENGE,
      signOptions: { expiresIn: '30d' },
    }),
  ],
  providers: [JwtStrategy],
})
export class AuthModule {}
