import { FastifyInstance } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';

export async function registerSwagger(app: FastifyInstance): Promise<void> {
  await app.register(fastifySwagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'Microservice Users API',
        description: 'API for user management and authentication',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3002',
          description: 'Development server',
        },
      ],
      tags: [
        {
          name: 'Auth',
          description: 'Authentication operations',
        },
        {
          name: 'Users',
          description: 'User management operations',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await app.register(fastifySwaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
    staticCSP: true,
  });
}
