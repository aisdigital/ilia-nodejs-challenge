import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SWAGGER_URL } from 'src/environments/server';

export const swagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('NestJs REST API example')
    .setDescription(
      `A complete user registry, with access
      permissions, JWT token, integration and
      unit tests, using theRESTful API pattern.`,
    )
    .setExternalDoc('Schemas', `/${SWAGGER_URL}-json`)
    .setContact(
      'Felipe Lelis',
      'https://www.linkedin.com/in/felipesrlelis/',
      'felipesrlgo@gmail.com',
    )
    .setVersion('2.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(SWAGGER_URL, app, document);
};
