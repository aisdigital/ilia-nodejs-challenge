import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //FIXME Alterar para usar variaveis por ambiente
  await app.listen(3002);
}
bootstrap();
