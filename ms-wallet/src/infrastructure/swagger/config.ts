import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Microservice Wallet API',
      version: '1.0.0',
      description: 'API para gerenciamento de transações financeiras da carteira digital',
      contact: {
        name: 'ília Digital',
        email: 'dev@ilia.digital'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Desenvolvimento Local'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Token de autenticação'
        }
      },
      schemas: {
        Transaction: {
          type: 'object',
          required: ['user_id', 'amount', 'type'],
          properties: {
            user_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID do usuário'
            },
            amount: {
              type: 'integer',
              minimum: 1,
              description: 'Valor da transação em centavos'
            },
            type: {
              type: 'string',
              enum: ['CREDIT', 'DEBIT'],
              description: 'Tipo da transação'
            }
          },
          example: {
            user_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            amount: 10000,
            type: 'CREDIT'
          }
        },
        TransactionResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único da transação'
            },
            user_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID do usuário'
            },
            amount: {
              type: 'integer',
              description: 'Valor da transação em centavos'
            },
            type: {
              type: 'string',
              enum: ['CREDIT', 'DEBIT'],
              description: 'Tipo da transação'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação da transação'
            }
          }
        },
        Balance: {
          type: 'object',
          properties: {
            amount: {
              type: 'integer',
              description: 'Saldo atual em centavos'
            }
          },
          example: {
            amount: 25000
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensagem de erro'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Transactions',
        description: 'Operações relacionadas a transações financeiras'
      },
      {
        name: 'Balance',
        description: 'Consulta de saldo da carteira'
      },
      {
        name: 'Health',
        description: 'Health check do serviço'
      }
    ]
  },
  apis: [
    './src/presentation/routes/*.ts',
    './src/presentation/controllers/*.ts'
  ]
};

export const swaggerSpec = swaggerJsdoc(options);