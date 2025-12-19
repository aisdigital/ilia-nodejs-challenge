import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

import { DatabaseConnection } from './infrastructure/database/DatabaseConnection';
import { swaggerSpec } from './infrastructure/swagger/config';
import { PostgresUserRepository } from './infrastructure/repositories/PostgresUserRepository';
import { CreateUserUseCase } from './domain/use-cases/CreateUserUseCase';
import { AuthenticateUserUseCase } from './domain/use-cases/AuthenticateUserUseCase';
import { GetAllUsersUseCase } from './domain/use-cases/GetAllUsersUseCase';
import { GetUserByIdUseCase } from './domain/use-cases/GetUserByIdUseCase';
import { UpdateUserUseCase } from './domain/use-cases/UpdateUserUseCase';
import { DeleteUserUseCase } from './domain/use-cases/DeleteUserUseCase';
import { UserController } from './presentation/controllers/UserController';
import { AuthController } from './presentation/controllers/AuthController';
import { UserRoutes } from './presentation/routes/UserRoutes';
import { AuthMiddleware } from './infrastructure/middleware/AuthMiddleware';
import { LoggingMiddleware } from './infrastructure/middleware/LoggingMiddleware';
import { Logger } from './infrastructure/logging/Logger';
import { healthRoutes } from './presentation/routes/healthRoutes';

dotenv.config();

export class App {
  private express: Express;
  private port: number;
  private database: DatabaseConnection;

  constructor() {
    this.express = express();
    this.port = parseInt(process.env.PORT || '3002');
    this.database = DatabaseConnection.getInstance();
    
    this.setupMiddlewares();
    this.setupRoutes();
  }

  private setupMiddlewares(): void {
    this.express.use(LoggingMiddleware.requestLogger());

    this.express.use(helmet());
    this.express.use(cors());

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, 
      max: 100, 
      message: 'Too many requests from this IP'
    });
    this.express.use(limiter);

    this.express.use(express.json({ limit: '10mb' }));
    this.express.use(express.urlencoded({ extended: true, limit: '10mb' }));

    this.express.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Users API Documentation'
    }));


  }

  private setupRoutes(): void {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    const walletServiceUrl = process.env.WALLET_SERVICE_URL;
    const internalJwtSecret = process.env.JWT_INTERNAL_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    if (!walletServiceUrl) {
      throw new Error('WALLET_SERVICE_URL environment variable is required');
    }

    if (!internalJwtSecret) {
      throw new Error('JWT_INTERNAL_SECRET environment variable is required');
    }

    const pool = this.database.getPool();
    const userRepository = new PostgresUserRepository(pool);
    
    const createUserUseCase = new CreateUserUseCase(userRepository);
    const authenticateUserUseCase = new AuthenticateUserUseCase(userRepository, jwtSecret, jwtExpiresIn);
    const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
    const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
    const updateUserUseCase = new UpdateUserUseCase(userRepository);
    const deleteUserUseCase = new DeleteUserUseCase(userRepository);
    
    const userController = new UserController(
      createUserUseCase,
      getAllUsersUseCase,
      getUserByIdUseCase,
      updateUserUseCase,
      deleteUserUseCase
    );

    const authController = new AuthController(authenticateUserUseCase);

    const authMiddleware = new AuthMiddleware(jwtSecret);
    const userRoutes = new UserRoutes(userController, authController, authMiddleware);

    this.express.use('/', userRoutes.router);
    this.express.use('/health', healthRoutes);

    this.express.use(LoggingMiddleware.errorLogger());

    this.express.use('*', (req, res) => {
      Logger.getInstance().warn('Route not found', {
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
      Logger.getInstance().info('Starting MS-Users application', {
        port: this.port,
        environment: process.env.NODE_ENV || 'development'
      });

      await this.database.initialize();
      Logger.getInstance().info('Database initialized successfully');
      
      this.express.listen(this.port, () => {
        Logger.getInstance().info('MS-Users server started successfully', {
          port: this.port,
          serverUrl: `http://localhost:${this.port}`,
          swaggerUrl: `http://localhost:${this.port}/api-docs`,
          healthUrl: `http://localhost:${this.port}/health`
        });

        console.log('🚀 ===============================================');
        console.log('👥 MS-Users (Microservice Usuários)');
        console.log('🚀 ===============================================');
        console.log(`🔗 Server running on: http://localhost:${this.port}`);
        console.log(`📚 Swagger Documentation: http://localhost:${this.port}/api-docs`);
        console.log(`💚 Health Check: http://localhost:${this.port}/health`);
        console.log('🚀 ===============================================');
      });
    } catch (error) {
      Logger.getInstance().error('Failed to start MS-Users server', error instanceof Error ? error : new Error('Unknown startup error'));
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public getExpressApp(): Express {
    return this.express;
  }
}