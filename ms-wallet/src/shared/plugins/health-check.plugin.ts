import { FastifyInstance } from 'fastify';
import { sequelize } from '../../config/database';
import { logger } from '../utils/logger';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  service: string;
  version: string;
  checks: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
    };
    memory: {
      used: number;
      free: number;
      total: number;
      percentage: number;
    };
    grpc: {
      status: 'up' | 'down';
      port: number;
    };
  };
}

export async function registerHealthCheck(app: FastifyInstance): Promise<void> {
  app.get('/health', async (_request, reply) => {
    const startTime = Date.now();
    let dbStatus: 'up' | 'down' = 'down';
    let dbResponseTime: number | undefined;

    try {
      await sequelize.authenticate();
      dbResponseTime = Date.now() - startTime;
      dbStatus = 'up';
    } catch (error) {
      logger.error({ message: 'Database health check failed', error });
    }

    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal;
    const usedMemory = memoryUsage.heapUsed;
    const freeMemory = totalMemory - usedMemory;
    const memoryPercentage = (usedMemory / totalMemory) * 100;

    const health: HealthStatus = {
      status: dbStatus === 'up' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'ms-wallet',
      version: '1.0.0',
      checks: {
        database: {
          status: dbStatus,
          responseTime: dbResponseTime,
        },
        memory: {
          used: Math.round(usedMemory / 1024 / 1024), // MB
          free: Math.round(freeMemory / 1024 / 1024), // MB
          total: Math.round(totalMemory / 1024 / 1024), // MB
          percentage: Math.round(memoryPercentage),
        },
        grpc: {
          status: 'up', 
          port: 50051,
        },
      },
    };

    const statusCode = health.status === 'healthy' ? 200 : 503;
    return reply.status(statusCode).send(health);
  });

  app.get('/ready', async (_request, reply) => {
    try {
      await sequelize.authenticate();
      return reply.status(200).send({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error({ message: 'Readiness check failed', error });
      return reply.status(503).send({
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        reason: 'Database connection failed',
      });
    }
  });

  app.get('/live', async (_request, reply) => {
    return reply.status(200).send({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  logger.info('Health check endpoints registered: /health, /ready, /live');
}
