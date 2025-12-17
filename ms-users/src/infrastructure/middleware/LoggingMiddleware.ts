import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../logging/Logger';

// Extensão da interface Request para incluir correlationId
declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      startTime?: number;
    }
  }
}

export class LoggingMiddleware {
  
  /**
   * Middleware para adicionar correlation ID e fazer log de requests/responses
   */
  public static requestLogger() {
    return (req: Request, res: Response, next: NextFunction): void => {
      // Gerar ou usar correlation ID existente
      req.correlationId = req.get('X-Correlation-ID') || uuidv4();
      req.startTime = Date.now();

      // Adicionar correlation ID ao response header
      res.setHeader('X-Correlation-ID', req.correlationId);

      // Extrair informações da requisição
      const requestContext = {
        correlationId: req.correlationId,
        method: req.method,
        url: req.originalUrl,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        contentLength: req.get('Content-Length'),
        referer: req.get('Referer'),
        userId: LoggingMiddleware.extractUserId(req),
        timestamp: new Date().toISOString()
      };

      // Log específico de entrada da request com destaque
      logger.info(`🔄 REQUEST INCOMING: ${req.method} ${req.originalUrl}`, {
        ...requestContext,
        requestId: req.correlationId,
        category: 'request_entry'
      });

      // Log da requisição (mantém compatibilidade)
      logger.request(req.method, req.originalUrl, requestContext);

      // Interceptar o response para fazer log
      const originalJson = res.json;
      const originalSend = res.send;
      
      res.json = function(body: any) {
        LoggingMiddleware.logResponse(req, res, body);
        return originalJson.call(this, body);
      };

      res.send = function(body: any) {
        LoggingMiddleware.logResponse(req, res, body);
        return originalSend.call(this, body);
      };

      next();
    };
  }

  /**
   * Middleware específico para operações de auditoria
   */
  public static auditLogger(action: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const auditContext = {
        correlationId: req.correlationId,
        action,
        userId: LoggingMiddleware.extractUserId(req),
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        requestBody: LoggingMiddleware.sanitizeRequestBody(req.body)
      };

      logger.audit(action, auditContext);
      next();
    };
  }

  /**
   * Middleware para capturar erros não tratados
   */
  public static errorLogger() {
    return (error: Error, req: Request, res: Response, next: NextFunction): void => {
      const errorContext = {
        correlationId: req.correlationId,
        method: req.method,
        url: req.originalUrl,
        userId: LoggingMiddleware.extractUserId(req),
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        requestBody: LoggingMiddleware.sanitizeRequestBody(req.body),
        stack: error.stack,
        name: error.name
      };

      logger.error(`Unhandled error in ${req.method} ${req.originalUrl}`, errorContext);
      
      // Passar o erro adiante
      next(error);
    };
  }

  /**
   * Log do response
   */
  private static logResponse(req: Request, res: Response, body?: any): void {
    if (!req.startTime) return;

    const duration = Date.now() - req.startTime;
    const responseContext = {
      correlationId: req.correlationId,
      userId: LoggingMiddleware.extractUserId(req),
      duration,
      statusCode: res.statusCode,
      contentLength: res.get('Content-Length') || JSON.stringify(body || '').length
    };

    // Log de performance para requests lentos
    if (duration > 1000) {
      logger.performance(`Slow request detected: ${req.method} ${req.originalUrl}`, {
        ...responseContext,
        threshold: '1000ms'
      });
    }

    // Log de response
    logger.response(req.method, req.originalUrl, res.statusCode, duration, responseContext);

    // Log de segurança para tentativas de acesso não autorizado
    if (res.statusCode === 401 || res.statusCode === 403) {
      logger.security(`Unauthorized access attempt: ${req.method} ${req.originalUrl}`, responseContext);
    }
  }

  /**
   * Extrai o ID do usuário do token JWT se disponível
   */
  private static extractUserId(req: Request): string | undefined {
    try {
      const authHeader = req.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return undefined;
      }

      const token = authHeader.substring(7);
      // Decodificar JWT sem verificar (só para extrair userId para logs)
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      return payload.userId || payload.sub || payload.id;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Sanitiza o body da requisição removendo informações sensíveis
   */
  private static sanitizeRequestBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}

export default LoggingMiddleware;