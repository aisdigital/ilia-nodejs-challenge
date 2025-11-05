import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';
import { ValidationPipe, Logger } from '@nestjs/common';

const logger = new Logger('UsersMain');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const httpPort = process.env.USERS_PORT || 3000;

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'users_internal',
      protoPath: join(__dirname, 'shared/grpc/users.proto'),
      url: process.env.USERS_GRPC_URL || '0.0.0.0:50051',
    },
  });

  await app.startAllMicroservices();

  await app.listen(httpPort, () => {
    logger.log(`Microservice Users HTTP running on port: ${httpPort}`);
    logger.log(
      `Microservice Users gRPC running on: ${process.env.USERS_GRPC_URL || '0.0.0.0:50051'}`,
    );
  });
}
void bootstrap();
