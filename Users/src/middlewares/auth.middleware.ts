import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import { UserEntity } from '@entities/users.entity';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';

const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const Authorization = extractAuthorization(req);
    if (!Authorization) return next(new HttpException(401, 'Access token is missing or invalid'));

    const secretKey: string = SECRET_KEY;
    const { id } = (await verify(Authorization, secretKey)) as DataStoredInToken;
    const findUser = await UserEntity.findOne(id, { select: ['id', 'email', 'password'] });
    if (!findUser) return next(new HttpException(401, 'Wrong authentication token'));

    req.user = findUser;
    next();
  } catch (error) {
    next(new HttpException(401, 'Wrong authentication token'));
  }
};

function extractAuthorization(req: RequestWithUser) {
  return req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null;
}

export default authMiddleware;
