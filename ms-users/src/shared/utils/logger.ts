import pino from 'pino';
import { env } from '../../config/env';

const loggerConfig: pino.LoggerOptions = {
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
  base: {
    service: 'ms-users',
    environment: env.NODE_ENV,
    version: '1.0.0',
  },
};

if (env.NODE_ENV === 'development') {
  loggerConfig.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
      singleLine: false,
    },
  };
}

export const logger = pino(loggerConfig);

export const loggers = {
  database: logger.child({ context: 'database' }),
  grpc: logger.child({ context: 'grpc' }),
  user: logger.child({ context: 'user' }),
  auth: logger.child({ context: 'auth' }),
  server: logger.child({ context: 'server' }),
};

export const logError = (error: unknown, context?: string) => {
  const log = context ? logger.child({ context }) : logger;
  
  if (error instanceof Error) {
    log.error({
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
  } else {
    log.error({ error: String(error) });
  }
};

export const logRequest = (
  method: string,
  url: string,
  statusCode: number,
  responseTime: number,
  requestId?: string
) => {
  logger.info({
    type: 'http_request',
    method,
    url,
    statusCode,
    responseTime,
    requestId,
  });
};
