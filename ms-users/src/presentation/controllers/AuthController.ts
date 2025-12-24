import { Request, Response } from 'express';
import { AuthenticateUserUseCase } from '../../domain/use-cases/AuthenticateUserUseCase';
import { Logger } from '../../infrastructure/logging/Logger';
import Joi from 'joi';

export class AuthController {
  constructor(private authenticateUserUseCase: AuthenticateUserUseCase) {}

  private validateAuth = Joi.object({
    user: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    }).required()
  });

  public authenticate = async (req: Request, res: Response): Promise<void> => {
    const logContext = {
      correlationId: (req as any).correlationId,
      action: 'authenticate_user',
      userEmail: req.body?.user?.email,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };

    try {
      Logger.getInstance().info('Starting user authentication', {
        ...logContext,
        attemptedEmail: req.body?.user?.email,
        requestStructure: {
          hasUser: !!req.body?.user,
          hasEmail: !!req.body?.user?.email,
          hasPassword: !!req.body?.user?.password
        }
      });
      
      const { error, value } = this.validateAuth.validate(req.body);
      
      if (error) {
        Logger.getInstance().warn('Authentication validation failed', {
          ...logContext,
          validationError: error.details[0].message,
          validationPath: error.details[0].path,
          attemptedEmail: req.body?.user?.email
        });
        res.status(400).json({ 
          error: error.details[0].message,
          code: 'VALIDATION_ERROR'
        });
        return;
      }

      Logger.getInstance().debug('Authentication validation passed', {
        ...logContext,
        email: value.user.email
      });

      const result = await this.authenticateUserUseCase.execute({
        email: value.user.email,
        password: value.user.password
      });

      Logger.getInstance().auth('✅ User authenticated successfully', {
        ...logContext,
        userId: result.user.id,
        userEmail: result.user.email,
        userFirstName: result.user.firstName,
        userLastName: result.user.lastName,
        loginTime: new Date().toISOString(),
        tokenGenerated: !!result.accessToken,
        processingTime: Date.now() - (req as any).startTime
      });

      res.status(200).json({
        user: result.user.toJSON(),
        access_token: result.accessToken
      });
    } catch (error: any) {
      const errorDetails = {
        ...logContext,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        attemptedEmail: req.body?.user?.email,
        timestamp: new Date().toISOString()
      };
      
      if (error.message === 'Invalid email or password') {
        Logger.getInstance().security('Authentication failed - invalid credentials', {
          ...errorDetails,
          reason: 'invalid_credentials',
          errorType: 'INVALID_CREDENTIALS'
        });
        res.status(401).json({ 
          error: error.message,
          code: 'INVALID_CREDENTIALS'
        });
      } else if (error.message?.includes('database') || error.message?.includes('connection')) {
        Logger.getInstance().error('Authentication failed - database error', {
          ...errorDetails,
          errorType: 'DATABASE_ERROR'
        });
        res.status(503).json({ 
          error: 'Service temporarily unavailable',
          code: 'DATABASE_ERROR'
        });
      } else if (error.message?.includes('jwt') || error.message?.includes('token')) {
        Logger.getInstance().error('Authentication failed - token generation error', {
          ...errorDetails,
          errorType: 'TOKEN_ERROR'
        });
        res.status(500).json({ 
          error: 'Authentication token generation failed',
          code: 'TOKEN_ERROR'
        });
      } else {
        Logger.getInstance().error('Authentication failed - unexpected error', {
          ...errorDetails,
          errorType: 'UNEXPECTED_ERROR'
        });
        res.status(500).json({ 
          error: 'Internal server error during authentication',
          code: 'UNEXPECTED_ERROR'
        });
      }
    }
  };
}