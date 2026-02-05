import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }),
});

const SENSITIVE_FIELDS = ['password', 'token', 'access_token', 'secret', 'api_key'];
const SENSITIVE_HEADERS = ['authorization', 'x-api-key', 'x-token'];

export function sanitize(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitize(item));
  }

  const sanitized: any = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const lowerKey = key.toLowerCase();
      const value = obj[key];

      if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
}

function sanitizeHeaders(headers: any): any {
  const sanitized: any = {};

  for (const key in headers) {
    if (Object.prototype.hasOwnProperty.call(headers, key)) {
      const lowerKey = key.toLowerCase();
      const value = headers[key];

      if (SENSITIVE_HEADERS.some(field => lowerKey.includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
}

export function loggingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const correlationId = req.headers['x-correlation-id'] as string || uuidv4();

  req.headers['x-correlation-id'] = correlationId;
  (req as any).correlationId = correlationId;

  const requestLog = {
    correlationId,
    method: req.method,
    url: req.originalUrl,
    headers: sanitizeHeaders(req.headers),
    body: sanitize(req.body),
    ip: req.ip,
    timestamp: new Date().toISOString(),
  };

  logger.info({ request: requestLog }, `${req.method} ${req.originalUrl}`);

  const originalSend = res.send;
  let responseBody: any;

  res.send = function(data: any) {
    responseBody = data;

    try {
      if (typeof data === 'string') {
        responseBody = JSON.parse(data);
      }
    } catch {
      responseBody = data;
    }

    const responseLog = {
      correlationId,
      statusCode: res.statusCode,
      headers: sanitizeHeaders(res.getHeaders()),
      body: sanitize(responseBody),
      timestamp: new Date().toISOString(),
    };

    const logLevel = res.statusCode >= 400 ? 'error' : 'info';
    logger[logLevel as 'info' | 'error']({ response: responseLog }, `Response ${res.statusCode}`);

    res.set('x-correlation-id', correlationId);

    return originalSend.call(this, data);
  };

  next();
}
