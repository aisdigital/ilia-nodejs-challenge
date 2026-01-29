import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger
  if (process.env.NODE_ENV !== 'test') {
    try {
      // @ts-ignore: optional dependency for Swagger UI; ignore missing types at compile-time
      const { SwaggerModule, DocumentBuilder } = await import('@nestjs/swagger');
      const config = new DocumentBuilder()
        .setTitle('Users Service')
        .setDescription('Users service API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api', app, document);
    } catch (e) {
      console.warn('Swagger not enabled:', e.message);
    }
  }

  const port = Number(process.env.PORT);
  await app.listen(port);
}

bootstrap();
