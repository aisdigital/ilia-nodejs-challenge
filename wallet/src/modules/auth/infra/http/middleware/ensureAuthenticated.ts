import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import AppError from '@shared/errors/AppErros';
import authConfig from '@config/auth';

export default function ensureAuthenticated(
  request: Request,
  _: Response,
  next: NextFunction,
): void {
  const authHeader = request?.headers?.authorization || '';

  const [, token] = authHeader.split(' ');
  if (!token)
    throw new AppError('Favor, é preciso estar logado para continuar', 401);

  try {
    verify(token, authConfig.jwt.secret);
    return next();
  } catch (error) {
    throw new AppError('Favor, é preciso estar logado para continuar', 401);
  }
}
