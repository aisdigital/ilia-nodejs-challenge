import { FastifyInstance } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { env } from '../../config/env';

export async function registerSwagger(app: FastifyInstance): Promise<void> {
  await app.register(fastifySwagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'MS-Wallet API',
        description: 'Production-ready Financial Wallet Microservice API.',
        version: '2.0.0',
        contact: {
          name: 'API Support',
        },
        license: {
          name: 'MIT',
        },
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: 'Development server',
        },
      ],
      tags: [
        {
          name: 'Transactions',
          description: 'Financial transaction operations (CREDIT/DEBIT)',
        },
        {
          name: 'Balance',
          description: 'User balance queries',
        },
        {
          name: 'Health',
          description: 'Service health and monitoring',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT token obtained from MS-Users /auth/login endpoint',
          },
        },
        headers: {
          'Idempotency-Key': {
            description: 'Unique key for idempotent requests (UUID format)',
            schema: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
          },
          'X-RateLimit-Limit': {
            description: 'Maximum requests per time window',
            schema: {
              type: 'integer',
              example: 30,
            },
          },
          'X-RateLimit-Remaining': {
            description: 'Remaining requests in current window',
            schema: {
              type: 'integer',
              example: 25,
            },
          },
          'X-RateLimit-Reset': {
            description: 'Unix timestamp when rate limit window resets',
            schema: {
              type: 'integer',
              example: 1706400000,
            },
          },
        },
        schemas: {
          Error: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                description: 'Error code',
                example: 'VALIDATION_ERROR',
              },
              message: {
                type: 'string',
                description: 'Human-readable error message',
                example: 'Invalid request parameters',
              },
            },
            required: ['code', 'message'],
          },
          Transaction: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                description: 'Transaction ID',
              },
              user_id: {
                type: 'string',
                format: 'uuid',
                description: 'User ID',
              },
              amount: {
                type: 'number',
                minimum: 1,
                description: 'Transaction amount',
              },
              type: {
                type: 'string',
                enum: ['CREDIT', 'DEBIT'],
                description: 'Transaction type',
              },
              created_at: {
                type: 'string',
                format: 'date-time',
              },
              updated_at: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
          Balance: {
            type: 'object',
            properties: {
              amount: {
                type: 'number',
                description: 'Current balance (CREDIT - DEBIT)',
                example: 1500.50,
              },
            },
          },
          HealthCheck: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['healthy', 'unhealthy', 'degraded'],
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
              },
              uptime: {
                type: 'number',
                description: 'Service uptime in seconds',
              },
              service: {
                type: 'string',
                example: 'ms-wallet',
              },
              version: {
                type: 'string',
                example: '2.0.0',
              },
              checks: {
                type: 'object',
                properties: {
                  database: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', enum: ['up', 'down'] },
                      responseTime: { type: 'number' },
                    },
                  },
                  memory: {
                    type: 'object',
                    properties: {
                      used: { type: 'number' },
                      free: { type: 'number' },
                      total: { type: 'number' },
                      percentage: { type: 'number' },
                    },
                  },
                  grpc: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', enum: ['up', 'down'] },
                      port: { type: 'number' },
                    },
                  },
                  rateLimiter: {
                    type: 'object',
                    description: 'Rate limiter and backpressure metrics',
                  },
                },
              },
            },
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