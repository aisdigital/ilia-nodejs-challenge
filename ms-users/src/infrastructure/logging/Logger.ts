import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

export interface LogContext {
  correlationId?: string;
  userId?: string;
  method?: string;
  url?: string;
  ip?: string;
  userAgent?: string;
  [key: string]: any;
}

export class Logger {
  private static instance: Logger;
  private logger: winston.Logger;

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
    // Formato simples para arquivos de texto
    const simpleTextFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.printf((info) => {
        const { timestamp, level, message, correlationId, userId, method, url, ip } = info;
        
        // Log simples em texto
        let logLine = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        
        if (correlationId) logLine += ` | ID: ${correlationId}`;
        if (userId) logLine += ` | User: ${userId}`;
        if (method && url) logLine += ` | ${method} ${url}`;
        if (ip) logLine += ` | IP: ${ip}`;
        
        return logLine;
      })
    );

    // Console format para desenvolvimento
    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({
        format: 'HH:mm:ss'
      }),
      winston.format.printf((info) => {
        const { timestamp, level, message } = info;
        return `[${timestamp}] ${level}: ${message}`;
      })
    );

    const transports: winston.transport[] = [
      // Console sempre ativo
      new winston.transports.Console({
        format: consoleFormat,
        level: 'debug'
      })
    ];

    // Arquivo de log simples
    const logsDir = path.join(process.cwd(), 'logs');
    
    transports.push(
      new DailyRotateFile({
        filename: path.join(logsDir, 'users-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        format: simpleTextFormat,
        maxFiles: '30d',
        maxSize: '10m',
        level: 'info'
      })
    );

    return winston.createLogger({
      level: 'debug',
      transports
    });
  }

  public info(message: string, context?: LogContext): void {
    this.logger.info(message, context || {});
  }

  public error(message: string, context?: LogContext | Error): void {
    if (context instanceof Error) {
      this.logger.error(message, {
        error: context.message,
        stack: context.stack,
        name: context.name
      });
    } else {
      this.logger.error(message, context || {});
    }
  }

  public warn(message: string, context?: LogContext): void {
    this.logger.warn(message, context || {});
  }

  public debug(message: string, context?: LogContext): void {
    this.logger.debug(message, context || {});
  }

  // Métodos customizados para diferentes tipos de log
  public user(message: string, context?: LogContext): void {
    this.logger.info(message, { ...context, category: 'user' });
  }

  public auth(message: string, context?: LogContext): void {
    this.logger.info(message, { ...context, category: 'auth' });
  }

  public security(message: string, context?: LogContext): void {
    this.logger.warn(message, { ...context, category: 'security' });
  }

  public audit(message: string, context?: LogContext): void {
    this.logger.info(message, { ...context, category: 'audit' });
  }

  public performance(message: string, context?: LogContext): void {
    this.logger.warn(message, { ...context, category: 'performance' });
  }

  public request(method: string, url: string, context?: LogContext): void {
    this.logger.info(`${method} ${url}`, { ...context, category: 'request' });
  }

  public response(method: string, url: string, status: number, duration: number, context?: LogContext): void {
    this.logger.info(`${method} ${url} - ${status} (${duration}ms)`, { 
      ...context, 
      category: 'response',
      status,
      duration
    });
  }

  public transaction(message: string, context?: LogContext): void {
    this.logger.info(message, { ...context, category: 'transaction' });
  }
}