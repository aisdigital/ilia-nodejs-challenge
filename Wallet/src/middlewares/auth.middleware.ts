import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';
import { UserEntity } from '@/entities/users.entity';

const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const message401 = 'Access token is missing or invalid';
  try {
    const Authorization = extractAuthorization(req);
    if (!Authorization) return next(new HttpException(401, message401));

    const secretKey: string = SECRET_KEY;
    const { id } = (await verify(Authorization, secretKey)) as DataStoredInToken;
    const findUser = await UserEntity.findOne(id);
    console.log(findUser, '---------------------------');
    if (!findUser || !findUser.activated) return next(new HttpException(401, message401));

    req.user = findUser;
    next();
  } catch (error) {
    next(new HttpException(401, message401));
  }
};

function extractAuthorization(req: RequestWithUser) {
  return req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null;
}

export default authMiddleware;
