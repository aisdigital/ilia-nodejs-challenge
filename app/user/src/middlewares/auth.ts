import { unauthorized } from '@hapi/boom';
import { StatusCodes } from 'http-status-codes';
import { Request, RequestHandler } from 'express';
import { getUserFromJwt } from '../services/auth';

export async function authenticateUserRequest(req: Request) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw unauthorized('Authorization header missing.');
  }

  const [type, token] = authHeader.split(' ') ?? [];
  const isBearerToken = type.toLowerCase() === 'bearer';

  if (!isBearerToken) {
    throw unauthorized('Invalid authorization header');
  }

  return await getUserFromJwt(token);
}

const Authenticated: RequestHandler = async (req: Request, res, next) => {
  try {
    const user = await authenticateUserRequest(req);
    req.user = user;
    next();
  } catch (err) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json(unauthorized('Invalid user authentication'));
  }
};

export const ensureAuth = {
  Authenticated,
};
