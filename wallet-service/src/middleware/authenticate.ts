import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const INTERNAL_JWT_SECRET = process.env.INTERNAL_JWT_SECRET;

if (!INTERNAL_JWT_SECRET) {
  throw new Error('INTERNAL_JWT_SECRET environment variable is required');
}

declare global {
  namespace Express {
    interface Request {
      service?: any;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Missing authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Missing token' });
    return;
  }

  try {
    const service = jwt.verify(token, INTERNAL_JWT_SECRET);
    (req as any).service = service;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired internal token' });
  }
};


