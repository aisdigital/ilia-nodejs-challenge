import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { UserModule } from '@app/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { NestModule } from '@nestjs/common';
import { MiddlewareConsumer } from '@nestjs/common';
import { LoginValidationMiddleware } from './middlewares/loginValidation.middleware';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      secret: process.env.ILIACHALLENGE_INTERNAL,
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoginValidationMiddleware).forRoutes('auth');
  }
}
