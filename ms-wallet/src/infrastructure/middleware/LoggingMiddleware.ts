import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../logging/Logger';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      correlationId: string;
      startTime: number;
    }
  }
}

export const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = `req-wallet-${Date.now()}`;
  const correlationId = req.headers['x-correlation-id'] as string || uuidv4();
  
  req.requestId = requestId;
  req.correlationId = correlationId;
  req.startTime = Date.now();
  
  const userId = (req as any).user?.id || 'anonymous';
  
  // Log de entrada da request - conforme solicitado pelo usuário
  Logger.getInstance().info(`🔄 REQUEST INCOMING: ${req.method} ${req.originalUrl}`, {
    correlationId,
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId
  });
  
  res.setHeader('X-Correlation-ID', correlationId);
  next();
};

export const responseLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(body) {
    const duration = Date.now() - (req.startTime || Date.now());
    
    // Log de resposta
    Logger.getInstance().info(`✅ RESPONSE SENT: ${req.method} ${req.originalUrl}`, {
      correlationId: req.correlationId,
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    });
    
    // Log de performance se request demorou muito
    if (duration > 1000) {
      Logger.getInstance().warn(`⚠️ SLOW REQUEST: ${req.method} ${req.originalUrl}`, {
        correlationId: req.correlationId,
        duration: `${duration}ms`,
        threshold: '1000ms'
      });
    }
    
    return originalSend.call(this, body);
  };
  
  next();
};