import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',

  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    host: '0.0.0.0',
  },

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || '',
    internalSecret: process.env.JWT_INTERNAL_SECRET || '',
  },

  grpc: {
    userService: {
      host: process.env.USER_SERVICE_HOST || 'user-app',
      port: process.env.USER_GRPC_PORT || '50051',
    },
    protoPath: process.env.PROTO_PATH || '',
  },
};
