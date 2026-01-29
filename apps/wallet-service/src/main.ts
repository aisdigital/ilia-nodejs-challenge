import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  if (process.env.NODE_ENV !== 'test') {
    const requiredEnvVars = ['JWT_PRIVATE_KEY', 'PORT', 'GRPC_URL'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }
  
  const app = await NestFactory.create(AppModule);

  if (process.env.NODE_ENV !== 'test') {
    try {
      // @ts-ignore: optional dependency for Swagger UI; ignore missing types at compile-time
      const { SwaggerModule, DocumentBuilder } = await import('@nestjs/swagger');
      const config = new DocumentBuilder()
        .setTitle('Wallet Service')
        .setDescription('Wallet service API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api', app, document);
    } catch (e) {
      console.warn('Swagger not enabled:', e.message);
    }
  }
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'wallet',
      protoPath: join(__dirname, '../../proto/wallet.proto'),
      url: process.env.GRPC_URL,
    },
  });

  await app.startAllMicroservices();
  
  const port = Number(process.env.PORT);
  await app.listen(port);
  
  if (process.env.NODE_ENV !== 'test') {
    console.log(`🚀 Wallet Service running on HTTP port ${port}`);
    console.log(`🔗 Wallet Service gRPC listening on ${process.env.GRPC_URL}`);
    console.log(`💾 Database: ${process.env.DB_TYPE || 'sqlite'} on ${process.env.DB_HOST || 'memory'}`);
    console.log(`🔐 JWT: Configured`);
  }
}

bootstrap();
