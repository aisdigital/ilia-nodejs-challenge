import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

import { DatabaseConnection } from './infrastructure/database/DatabaseConnection';
import { swaggerSpec } from './infrastructure/swagger/config';
import { PostgresTransactionRepository } from './infrastructure/repositories/PostgresTransactionRepository';
import { CreateTransactionUseCase } from './domain/use-cases/CreateTransactionUseCase';
import { GetTransactionsUseCase } from './domain/use-cases/GetTransactionsUseCase';
import { GetBalanceUseCase } from './domain/use-cases/GetBalanceUseCase';
import { TransactionController } from './presentation/controllers/TransactionController';
import { TransactionRoutes } from './presentation/routes/TransactionRoutes';
import { AuthMiddleware } from './infrastructure/middleware/AuthMiddleware';
import { LoggingMiddleware } from './infrastructure/middleware/LoggingMiddleware';
import { logger } from './infrastructure/logging/Logger';
import { healthRoutes } from './presentation/routes/healthRoutes';

dotenv.config();

export class App {
  private express: Express;
  private port: number;
  private database: DatabaseConnection;

  constructor() {
    this.express = express();
    this.port = parseInt(process.env.PORT || '3001');
    this.database = DatabaseConnection.getInstance();
    
    this.setupMiddlewares();
    this.setupRoutes();
  }

  private setupMiddlewares(): void {
    // Logging middleware (deve ser o primeiro para capturar todos os requests)
    this.express.use(LoggingMiddleware.requestLogger());

    // Security middlewares
    this.express.use(helmet());
    this.express.use(cors());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP'
    });
    this.express.use(limiter);

    // Body parsing
    this.express.use(express.json({ limit: '10mb' }));
    this.express.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Swagger Documentation
    this.express.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Wallet API Documentation'
    }));


  }

  private setupRoutes(): void {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    // Setup dependencies
    const pool = this.database.getPool();
    const transactionRepository = new PostgresTransactionRepository(pool);
    
    const createTransactionUseCase = new CreateTransactionUseCase(transactionRepository);
    const getTransactionsUseCase = new GetTransactionsUseCase(transactionRepository);
    const getBalanceUseCase = new GetBalanceUseCase(transactionRepository);
    
    const transactionController = new TransactionController(
      createTransactionUseCase,
      getTransactionsUseCase,
      getBalanceUseCase
    );

    const authMiddleware = new AuthMiddleware(jwtSecret);
    const transactionRoutes = new TransactionRoutes(transactionController, authMiddleware);

    // Register routes (conforme especificação do desafio)
    this.express.use('/', transactionRoutes.router);
    this.express.use('/health', healthRoutes);

    // Error handling middleware (deve ser o último)
    this.express.use(LoggingMiddleware.errorLogger());

    // 404 handler
    this.express.use('*', (req, res) => {
      logger.warn('Route not found', {
        correlationId: (req as any).correlationId,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });
      res.status(404).json({ error: 'Route not found' });
    });
  }

  public async start(): Promise<void> {
    try {
      logger.info('Starting MS-Wallet application', {
        port: this.port,
        environment: process.env.NODE_ENV || 'development'
      });

      await this.database.initialize();
      logger.info('Database initialized successfully');
      
      this.express.listen(this.port, () => {
        logger.info('MS-Wallet server started successfully', {
          port: this.port,
          serverUrl: `http://localhost:${this.port}`,
          swaggerUrl: `http://localhost:${this.port}/api-docs`,
          healthUrl: `http://localhost:${this.port}/health`
        });

        // Console logs para desenvolvimento
        console.log('🚀 ===============================================');
        console.log('📱 MS-Wallet (Microservice Carteira Digital)');
        console.log('🚀 ===============================================');
        console.log(`🔗 Server running on: http://localhost:${this.port}`);
        console.log(`📚 Swagger Documentation: http://localhost:${this.port}/api-docs`);
        console.log(`💚 Health Check: http://localhost:${this.port}/health`);
        console.log('🚀 ===============================================');
      });
    } catch (error) {
      logger.error('Failed to start MS-Wallet server', error instanceof Error ? error : new Error('Unknown startup error'));
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public getExpressApp(): Express {
    return this.express;
  }
}