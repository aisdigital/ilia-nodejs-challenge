// Teste simples de log em arquivo de texto
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Logger simples apenas para arquivos de texto
function createSimpleLogger() {
  const textFormat = winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf((info) => {
      const { timestamp, level, message, correlationId, userId, method, url, ip } = info;
      
      let logLine = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
      
      if (correlationId) logLine += ` | ID: ${correlationId}`;
      if (userId) logLine += ` | User: ${userId}`;
      if (method && url) logLine += ` | ${method} ${url}`;
      if (ip) logLine += ` | IP: ${ip}`;
      
      return logLine;
    })
  );

  const logger = winston.createLogger({
    level: 'info',
    transports: [
      // Console 
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }),
      // Arquivo simples
      new DailyRotateFile({
        filename: path.join(process.cwd(), 'logs', 'simple-requests-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        format: textFormat,
        maxFiles: '7d',
        maxSize: '5m'
      })
    ]
  });

  return logger;
}

// Simular requests simples
function simulateSimpleRequests() {
  const logger = createSimpleLogger();
  
  console.log('=== Teste de Logs Simples em Arquivo ===\n');

  const requests = [
    { method: 'GET', url: '/health', correlationId: 'req-001', ip: '192.168.1.100' },
    { method: 'POST', url: '/transactions', correlationId: 'req-002', ip: '192.168.1.101', userId: 'user-456' },
    { method: 'GET', url: '/balance', correlationId: 'req-003', ip: '192.168.1.102', userId: 'user-456' },
    { method: 'POST', url: '/users', correlationId: 'req-004', ip: '10.0.0.50' },
    { method: 'POST', url: '/auth', correlationId: 'req-005', ip: '172.16.0.10' }
  ];

  requests.forEach((req, index) => {
    setTimeout(() => {
      logger.info(`REQUEST INCOMING: ${req.method} ${req.url}`, {
        correlationId: req.correlationId,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userId: req.userId
      });
    }, index * 200);
  });

  console.log('Logs sendo gravados em: logs/simple-requests-YYYY-MM-DD.log');
  console.log('Aguarde os logs...\n');
}

simulateSimpleRequests();