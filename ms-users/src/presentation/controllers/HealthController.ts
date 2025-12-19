import { Request, Response } from 'express';
import { DatabaseConnection } from '../../infrastructure/database/DatabaseConnection';
import { WalletService } from '../../infrastructure/services/WalletService';

export class HealthController {
  constructor(
    private database: DatabaseConnection,
    private walletService?: WalletService
  ) {}

  // Health check simples - apenas verifica se o servidor está rodando
  public simpleHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json({
        status: 'OK',
        service: 'ms-users',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    } catch (_) {
      res.status(503).json({
        status: 'ERROR',
        service: 'ms-users',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable'
      });
    }
  };

  // Health check completo - verifica integrações
  public detailedHealth = async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();
    const healthStatus: any = {
      status: 'OK',
      service: 'ms-users',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        server: { status: 'OK', message: 'Server is running' },
        database: { status: 'UNKNOWN', message: 'Not checked' },
        walletService: { status: 'UNKNOWN', message: 'Not checked' },
        memory: { status: 'OK', usage: process.memoryUsage() }
      }
    };

    // Verificar conexão com banco de dados
    try {
      const pool = this.database.getPool();
      const result = await pool.query('SELECT 1 as test');
      
      if (result.rows[0]?.test === 1) {
        healthStatus.checks.database = {
          status: 'OK',
          message: 'Database connection successful'
        };
      } else {
        throw new Error('Invalid database response');
      }
    } catch (error) {
      healthStatus.status = 'DEGRADED';
      healthStatus.checks.database = {
        status: 'ERROR',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Verificar integração com wallet service
    if (this.walletService) {
      try {
        // Teste simples de conectividade com o wallet service
        const walletServiceUrl = process.env.WALLET_SERVICE_URL;
        if (walletServiceUrl) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(`${walletServiceUrl}/health`, {
            method: 'GET',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            healthStatus.checks.walletService = {
              status: 'OK',
              message: 'Wallet service is reachable'
            };
          } else {
            throw new Error(`Wallet service returned ${response.status}`);
          }
        }
      } catch (error) {
        healthStatus.status = 'DEGRADED';
        healthStatus.checks.walletService = {
          status: 'ERROR',
          message: 'Wallet service connection failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    } else {
      healthStatus.checks.walletService = {
        status: 'SKIPPED',
        message: 'Wallet service integration not configured'
      };
    }

    // Verificar uso de memória
    const memUsage = process.memoryUsage();
    const memoryUsageMB = memUsage.heapUsed / 1024 / 1024;
    
    if (memoryUsageMB > 500) { // Alerta se usar mais de 500MB
      healthStatus.checks.memory.status = 'WARNING';
      healthStatus.checks.memory.message = 'High memory usage detected';
    }

    // Calcular tempo de resposta
    const responseTime = Date.now() - startTime;
    healthStatus.responseTime = `${responseTime}ms`;

    // Determinar status final
    const hasErrors = Object.values(healthStatus.checks).some((check: any) => check.status === 'ERROR');
    const hasWarnings = Object.values(healthStatus.checks).some((check: any) => check.status === 'WARNING');

    if (hasErrors) {
      healthStatus.status = 'ERROR';
      res.status(503);
    } else if (hasWarnings) {
      healthStatus.status = 'WARNING';
      res.status(200);
    } else {
      res.status(200);
    }

    res.json(healthStatus);
  };
}