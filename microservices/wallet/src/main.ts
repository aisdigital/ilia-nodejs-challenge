import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ApiWrapperInterceptor } from './shared/interceptors/api-wrapper.interceptor';
import { JwtAuthGuard } from './shared/auth/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new ApiWrapperInterceptor());
  app.useGlobalGuards(new JwtAuthGuard());
  const port = process.env.WALLET_PORT || 3001;

  await app.listen(port, () => {
    console.log(`\nMicroservice Wallet port running: ${port}`);
  });
}
void bootstrap();
