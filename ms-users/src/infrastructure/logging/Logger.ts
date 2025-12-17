import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

export interface LogContext {
  correlationId?: string;
  userId?: string;
  transactionId?: string;
  action?: string;
  duration?: number;
  statusCode?: number;
  userAgent?: string;
  ip?: string;
  method?: string;
  url?: string;
  [key: string]: any;
}

export class Logger {
  private static instance: Logger;
  private logger: winston.Logger;
  private serviceName: string = 'ms-users';
  private version: string = '1.0.0';

  private constructor() {
    this.logger = this.createLogger();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private createLogger(): winston.Logger {
    const isProduction = process.env.NODE_ENV === 'production';
    const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

    // Custom format para logs estruturados
    const structuredFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
      }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf((info) => {
        const logEntry: any = {
          timestamp: info.timestamp,
          level: info.level,
          message: info.message,
          service: this.serviceName,
          version: this.version,
          environment: process.env.NODE_ENV || 'development'
        };

        // Adicionar contexto adicional se existir
        if (info.meta && typeof info.meta === 'object') {
          Object.assign(logEntry, info.meta);
        }

        if (info.stack) {
          logEntry.stack = info.stack;
        }

        return JSON.stringify(logEntry);
      })
    );

    // Console format para desenvolvimento
    const consoleFormat = winston.format.combine(
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.colorize(),
      winston.format.errors({ stack: true }),
      winston.format.printf((info) => {
        let message = `${info.timestamp} [${info.level}] ${info.message}`;
        
        if (info.meta && Object.keys(info.meta).length > 0) {
          message += ` | ${JSON.stringify(info.meta)}`;
        }
        
        if (info.stack) {
          message += `\n${info.stack}`;
        }
        
        return message;
      })
    );

    const transports: winston.transport[] = [
      // Console output
      new winston.transports.Console({
        format: isProduction ? structuredFormat : consoleFormat,
        level: logLevel
      })
    ];

    // File transports apenas em produção ou se explicitamente configurado
    if (isProduction || process.env.ENABLE_FILE_LOGS === 'true') {
      const logsDir = path.join(process.cwd(), 'logs');

      // Log combinado com rotação diária
      transports.push(
        new DailyRotateFile({
          filename: path.join(logsDir, 'users-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
          format: structuredFormat,
          level: logLevel
        })
      );

      // Log de erros separado
      transports.push(
        new DailyRotateFile({
          filename: path.join(logsDir, 'users-error-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
          format: structuredFormat,
          level: 'error'
        })
      );

      // Log de auditoria para operações críticas
      transports.push(
        new DailyRotateFile({
          filename: path.join(logsDir, 'users-audit-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '90d', // Audit logs mantidos por mais tempo
          format: structuredFormat,
          level: 'info'
        })
      );
    }

    return winston.createLogger({
      level: logLevel,
      transports,
      exitOnError: false,
      // Tratamento de exceções não capturadas
      exceptionHandlers: [
        new winston.transports.Console({
          format: isProduction ? structuredFormat : consoleFormat
        })
      ],
      // Tratamento de promise rejections
      rejectionHandlers: [
        new winston.transports.Console({
          format: isProduction ? structuredFormat : consoleFormat
        })
      ]
    });
  }

  // Métodos para diferentes níveis de log
  public error(message: string, context?: LogContext | Error): void {
    if (context instanceof Error) {
      this.logger.error(message, {
        meta: {
          error: context.message,
          stack: context.stack,
          name: context.name
        }
      });
    } else {
      this.logger.error(message, { meta: context });
    }
  }

  public warn(message: string, context?: LogContext): void {
    this.logger.warn(message, { meta: context });
  }

  public info(message: string, context?: LogContext): void {
    this.logger.info(message, { meta: context });
  }

  public debug(message: string, context?: LogContext): void {
    this.logger.debug(message, { meta: context });
  }

  // Métodos específicos para operações de negócio
  public audit(action: string, context: LogContext): void {
    this.info(`AUDIT: ${action}`, {
      ...context,
      audit: true,
      category: 'business_operation'
    });
  }

  public user(message: string, context: LogContext): void {
    this.info(message, {
      ...context,
      category: 'user_management'
    });
  }

  public auth(message: string, context: LogContext): void {
    this.info(message, {
      ...context,
      category: 'authentication'
    });
  }

  public security(message: string, context: LogContext): void {
    this.warn(`SECURITY: ${message}`, {
      ...context,
      category: 'security'
    });
  }

  public performance(message: string, context: LogContext): void {
    this.info(`PERFORMANCE: ${message}`, {
      ...context,
      category: 'performance'
    });
  }

  // Método para logging de requests HTTP
  public request(method: string, url: string, context: LogContext): void {
    this.info(`${method} ${url}`, {
      ...context,
      category: 'http_request'
    });
  }

  // Método para logging de responses HTTP
  public response(method: string, url: string, statusCode: number, duration: number, context?: LogContext): void {
    const level = statusCode >= 400 ? 'warn' : 'info';
    const message = `${method} ${url} - ${statusCode} (${duration}ms)`;
    
    this.logger[level](message, {
      meta: {
        ...context,
        statusCode,
        duration,
        category: 'http_response'
      }
    });
  }

  // Getter para acessar o logger winston diretamente se necessário
  public getWinstonLogger(): winston.Logger {
    return this.logger;
  }
}

// Instância singleton exportada
export const logger = Logger.getInstance();