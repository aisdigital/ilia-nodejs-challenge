import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3001, () => {
    console.log('HTTP Server is running on http://localhost:3001');
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://rabbitmq:5672'], // Set your RabbitMQ credentials
      queue: 'create-transaction',
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
}
bootstrap();
