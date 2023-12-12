import { UserSchema } from '../types/auth';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

export const getUserFromJwt = (token: string) => {
  const user = jwt.verify(token, JWT_SECRET);

  return { user: UserSchema.parse(user), token: token };
};
