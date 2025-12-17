import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Microservice Users API',
      version: '1.0.0',
      description: 'API para gerenciamento de usuários e autenticação',
      contact: {
        name: 'ília Digital',
        email: 'dev@ilia.digital'
      }
    },
    servers: [
      {
        url: 'http://localhost:3002',
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
        UserRequest: {
          type: 'object',
          required: ['first_name', 'last_name', 'email', 'password'],
          properties: {
            first_name: {
              type: 'string',
              minLength: 1,
              description: 'Nome do usuário'
            },
            last_name: {
              type: 'string',
              minLength: 1,
              description: 'Sobrenome do usuário'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Senha do usuário (mínimo 6 caracteres)'
            }
          },
          example: {
            first_name: 'João',
            last_name: 'Silva',
            email: 'joao@email.com',
            password: '123456'
          }
        },
        UserUpdateRequest: {
          type: 'object',
          properties: {
            first_name: {
              type: 'string',
              minLength: 1,
              description: 'Nome do usuário'
            },
            last_name: {
              type: 'string',
              minLength: 1,
              description: 'Sobrenome do usuário'
            }
          },
          example: {
            first_name: 'João',
            last_name: 'Santos'
          }
        },
        UserResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único do usuário'
            },
            first_name: {
              type: 'string',
              description: 'Nome do usuário'
            },
            last_name: {
              type: 'string',
              description: 'Sobrenome do usuário'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação do usuário'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data de última atualização'
            }
          }
        },
        AuthRequest: {
          type: 'object',
          required: ['user'],
          properties: {
            user: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'Email do usuário'
                },
                password: {
                  type: 'string',
                  description: 'Senha do usuário'
                }
              }
            }
          },
          example: {
            user: {
              email: 'joao@email.com',
              password: '123456'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: {
              $ref: '#/components/schemas/UserResponse'
            },
            access_token: {
              type: 'string',
              description: 'JWT Token de acesso'
            }
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
        },
        DeleteResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'User deleted successfully'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Operações de autenticação'
      },
      {
        name: 'Users',
        description: 'Operações de gerenciamento de usuários'
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