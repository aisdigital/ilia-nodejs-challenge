import { Request, Response } from 'express';
import { AuthenticateUserUseCase } from '../../domain/use-cases/AuthenticateUserUseCase';
import { logger } from '../../infrastructure/logging/Logger';
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
      logger.info('Starting user authentication', logContext);
      
      const { error, value } = this.validateAuth.validate(req.body);
      
      if (error) {
        logger.warn('Authentication validation failed', {
          ...logContext,
          validationError: error.details[0].message
        });
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      logger.debug('Authentication validation passed', {
        ...logContext,
        email: value.user.email
      });

      const result = await this.authenticateUserUseCase.execute({
        email: value.user.email,
        password: value.user.password
      });

      logger.auth('User authenticated successfully', {
        ...logContext,
        userId: result.user.id,
        loginTime: new Date().toISOString()
      });

      res.status(200).json({
        user: result.user.toJSON(),
        access_token: result.accessToken
      });
    } catch (error: any) {
      if (error.message === 'Invalid email or password') {
        logger.security('Authentication failed - invalid credentials', {
          ...logContext,
          attemptedEmail: req.body?.user?.email,
          reason: 'invalid_credentials'
        });
        res.status(401).json({ error: error.message });
      } else {
        logger.error('Authentication system error', {
          ...logContext,
          error: error instanceof Error ? error : new Error('Unknown error')
        });
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}