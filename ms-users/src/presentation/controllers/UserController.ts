import { Request, Response } from 'express';
import { CreateUserUseCase } from '../../domain/use-cases/CreateUserUseCase';
import { GetAllUsersUseCase } from '../../domain/use-cases/GetAllUsersUseCase';
import { GetUserByIdUseCase } from '../../domain/use-cases/GetUserByIdUseCase';
import { UpdateUserUseCase } from '../../domain/use-cases/UpdateUserUseCase';
import { DeleteUserUseCase } from '../../domain/use-cases/DeleteUserUseCase';
import { AuthenticatedRequest } from '../../infrastructure/middleware/AuthMiddleware';
import { Logger } from '../../infrastructure/logging/Logger';
import Joi from 'joi';

export class UserController {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private getAllUsersUseCase: GetAllUsersUseCase,
    private getUserByIdUseCase: GetUserByIdUseCase,
    private updateUserUseCase: UpdateUserUseCase,
    private deleteUserUseCase: DeleteUserUseCase
  ) {}

  private validateCreateUser = Joi.object({
    first_name: Joi.string().trim().min(1).required(),
    last_name: Joi.string().trim().min(1).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });

  private validateUpdateUser = Joi.object({
    first_name: Joi.string().trim().min(1).optional(),
    last_name: Joi.string().trim().min(1).optional()
  });

  public createUser = async (req: Request, res: Response): Promise<void> => {
    const logContext = {
      correlationId: (req as any).correlationId,
      action: 'create_user',
      userEmail: req.body?.email
    };

    try {
      Logger.getInstance().info('Starting user creation', {
        ...logContext,
        requestBody: {
          firstName: req.body.first_name,
          lastName: req.body.last_name,
          email: req.body.email,
          hasPassword: !!req.body.password
        },
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });
      
      const { error, value } = this.validateCreateUser.validate(req.body);
      
      if (error) {
        Logger.getInstance().warn('User validation failed', {
          ...logContext,
          validationError: error.details[0].message,
          validationPath: error.details[0].path,
          providedFields: Object.keys(req.body),
          requiredFields: ['first_name', 'last_name', 'email', 'password']
        });
        res.status(400).json({ 
          error: error.details[0].message,
          field: error.details[0].path,
          code: 'VALIDATION_ERROR'
        });
        return;
      }

      Logger.getInstance().debug('User validation passed', {
        ...logContext,
        userData: {
          firstName: value.first_name,
          lastName: value.last_name,
          email: value.email
        }
      });

      const user = await this.createUserUseCase.execute({
        firstName: value.first_name,
        lastName: value.last_name,
        email: value.email,
        password: value.password
      });

      Logger.getInstance().user('✅ User created successfully', {
        ...logContext,
        userId: user.id,
        userEmail: user.email,
        userFirstName: user.firstName,
        userLastName: user.lastName,
        processingTime: Date.now() - (req as any).startTime
      });

      res.status(201).json(user.toJSON());
    } catch (error: any) {
      const errorDetails = {
        ...logContext,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        requestBody: req.body,
        timestamp: new Date().toISOString()
      };
      
      if (error.message === 'User with this email already exists') {
        Logger.getInstance().warn('User creation failed - email already exists', {
          ...errorDetails,
          errorType: 'EMAIL_ALREADY_EXISTS',
          attemptedEmail: req.body?.email
        });
        res.status(409).json({ 
          error: error.message,
          code: 'EMAIL_ALREADY_EXISTS'
        });
      } else if (error.message?.includes('database') || error.message?.includes('connection')) {
        Logger.getInstance().error('User creation failed - database error', {
          ...errorDetails,
          errorType: 'DATABASE_ERROR'
        });
        res.status(503).json({ 
          error: 'Service temporarily unavailable',
          code: 'DATABASE_ERROR'
        });
      } else if (error.message?.includes('validation')) {
        Logger.getInstance().error('User creation failed - validation error', {
          ...errorDetails,
          errorType: 'VALIDATION_ERROR'
        });
        res.status(400).json({ 
          error: 'Invalid user data provided',
          code: 'VALIDATION_ERROR'
        });
      } else {
        Logger.getInstance().error('User creation failed - unexpected error', {
          ...errorDetails,
          errorType: 'UNEXPECTED_ERROR'
        });
        res.status(500).json({ 
          error: 'Internal server error during user creation',
          code: 'UNEXPECTED_ERROR'
        });
      }
    }
  };

  public getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const users = await this.getAllUsersUseCase.execute();
      const response = users.map(user => user.toJSON());
      res.status(200).json(response);
    } catch (_) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  public getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.getUserByIdUseCase.execute({ id });
      res.status(200).json(user.toJSON());
    } catch (error: any) {
      if (error.message === 'User not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  public updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { error, value } = this.validateUpdateUser.validate(req.body);
      
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const user = await this.updateUserUseCase.execute({
        id,
        firstName: value.first_name,
        lastName: value.last_name
      });

      res.status(200).json(user.toJSON());
    } catch (error: any) {
      if (error.message === 'User not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  public deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.deleteUserUseCase.execute({ id });
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error: any) {
      if (error.message === 'User not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}