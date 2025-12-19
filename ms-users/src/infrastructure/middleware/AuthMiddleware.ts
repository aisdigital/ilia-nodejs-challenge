import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Logger } from '../logging/Logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    [key: string]: any;
  };
}

export class AuthMiddleware {
  private jwtSecret: string;

  constructor(jwtSecret: string) {
    this.jwtSecret = jwtSecret;
  }

  public authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const correlationId = (req as any).correlationId || 'unknown';
    const logContext = {
      correlationId,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      Logger.getInstance().security('🚫 Authentication failed - missing authorization header', {
        ...logContext,
        errorType: 'MISSING_AUTH_HEADER',
        reason: 'No authorization header provided'
      });
      res.status(401).json({ 
        error: 'Access token is missing',
        code: 'MISSING_TOKEN'
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      Logger.getInstance().security('🚫 Authentication failed - malformed authorization header', {
        ...logContext,
        errorType: 'MALFORMED_AUTH_HEADER',
        authHeader,
        reason: 'Authorization header does not contain Bearer token'
      });
      res.status(401).json({ 
        error: 'Access token is missing',
        code: 'INVALID_TOKEN_FORMAT'
      });
      return;
    }

    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      req.user = {
        userId: decoded.userId || decoded.sub,
        email: decoded.email,
        ...decoded
      };
      
      Logger.getInstance().debug('✅ JWT verification successful', {
        ...logContext,
        userId: req.user?.userId,
        userEmail: req.user?.email,
        tokenExp: decoded.exp,
        tokenIat: decoded.iat
      });
      
      next();
    } catch (error) {
      const errorDetails = {
        ...logContext,
        errorMessage: error instanceof Error ? error.message : 'Unknown JWT error',
        errorName: error instanceof Error ? error.name : 'UnknownError',
        tokenPrefix: token.substring(0, 10) + '...',
        timestamp: new Date().toISOString()
      };

      if (error instanceof jwt.TokenExpiredError) {
        Logger.getInstance().security('🚫 Authentication failed - token expired', {
          ...errorDetails,
          errorType: 'TOKEN_EXPIRED',
          expiredAt: error.expiredAt
        });
        res.status(401).json({ 
          error: 'Access token has expired',
          code: 'TOKEN_EXPIRED'
        });
      } else if (error instanceof jwt.JsonWebTokenError) {
        Logger.getInstance().security('🚫 Authentication failed - invalid token', {
          ...errorDetails,
          errorType: 'INVALID_TOKEN',
          jwtError: error.message
        });
        res.status(401).json({ 
          error: 'Access token is invalid',
          code: 'INVALID_TOKEN'
        });
      } else if (error instanceof jwt.NotBeforeError) {
        Logger.getInstance().security('🚫 Authentication failed - token not active yet', {
          ...errorDetails,
          errorType: 'TOKEN_NOT_ACTIVE',
          notBefore: error.date
        });
        res.status(401).json({ 
          error: 'Access token is not active yet',
          code: 'TOKEN_NOT_ACTIVE'
        });
      } else {
        Logger.getInstance().error('🚫 Authentication failed - unexpected error', {
          ...errorDetails,
          errorType: 'JWT_VERIFICATION_ERROR'
        });
        res.status(401).json({ 
          error: 'Access token verification failed',
          code: 'TOKEN_VERIFICATION_ERROR'
        });
      }
    }
  };
}