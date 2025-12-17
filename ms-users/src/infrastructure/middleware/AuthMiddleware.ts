import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: 'Access token is missing' });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access token is missing' });
      return;
    }

    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      req.user = {
        userId: decoded.userId || decoded.sub,
        email: decoded.email,
        ...decoded
      };
      next();
    } catch (error) {
      res.status(401).json({ error: 'Access token is invalid' });
    }
  };
}