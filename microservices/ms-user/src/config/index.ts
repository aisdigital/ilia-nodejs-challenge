import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',

  server: {
    port: parseInt(process.env.PORT || '3002', 10),
    host: '0.0.0.0',
  },

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'user_user',
    password: process.env.DB_PASSWORD || 'user_pass',
    name: process.env.DB_NAME || 'user_db',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'ILIACHALLENGE',
    internalSecret: process.env.JWT_INTERNAL_SECRET || 'ILIACHALLENGE_INTERNAL',
  },

  grpc: {
    port: process.env.GRPC_PORT || '50051',
    protoPath: process.env.PROTO_PATH || '',
  },
};
