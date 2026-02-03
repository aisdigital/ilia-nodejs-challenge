import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ILIACHALLENGE';
const INTERNAL_JWT_SECRET = process.env.ILIACHALLENGE_INTERNAL || 'ILIACHALLENGE_INTERNAL';

declare global {
  namespace Express {
    interface Request {
      user?: any;
      isInternal?: boolean;
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

  let user = null;
  let isInternal = false;

  try {
    user = jwt.verify(token, JWT_SECRET);
    isInternal = false;
  } catch (externalError) {
    try {
      user = jwt.verify(token, INTERNAL_JWT_SECRET);
      isInternal = true;
    } catch (internalError) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
  }

  (req as any).user = user;
  (req as any).isInternal = isInternal;
  next();
};
