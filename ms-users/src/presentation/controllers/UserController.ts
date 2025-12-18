import { Request, Response } from 'express';
import { CreateUserUseCase } from '../../domain/use-cases/CreateUserUseCase';
import { GetAllUsersUseCase } from '../../domain/use-cases/GetAllUsersUseCase';
import { GetUserByIdUseCase } from '../../domain/use-cases/GetUserByIdUseCase';
import { UpdateUserUseCase } from '../../domain/use-cases/UpdateUserUseCase';
import { DeleteUserUseCase } from '../../domain/use-cases/DeleteUserUseCase';
import { AuthenticatedRequest } from '../../infrastructure/middleware/AuthMiddleware';
import { logger } from '../../infrastructure/logging/Logger';
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
      logger.info('Starting user creation', logContext);
      
      const { error, value } = this.validateCreateUser.validate(req.body);
      
      if (error) {
        logger.warn('User validation failed', {
          ...logContext,
          validationError: error.details[0].message
        });
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      logger.debug('User validation passed', {
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

      logger.user('User created successfully', {
        ...logContext,
        userId: user.id,
        userEmail: user.email
      });

      res.status(200).json(user.toJSON());
    } catch (error: any) {
      if (error.message === 'User with this email already exists') {
        logger.warn('User creation failed - email already exists', {
          ...logContext,
          error: error.message
        });
        res.status(409).json({ error: error.message });
      } else {
        logger.error('Failed to create user', {
          ...logContext,
          error: error instanceof Error ? error : new Error('Unknown error')
        });
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  public getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const users = await this.getAllUsersUseCase.execute();
      const response = users.map(user => user.toJSON());
      res.status(200).json(response);
    } catch (error) {
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