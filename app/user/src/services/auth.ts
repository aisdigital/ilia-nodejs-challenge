import { User, UserSchema } from '../types/auth';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_SECRET_INTERNAL } from '../config';
import bcrypt from 'bcrypt';
import { unauthorized } from '@hapi/boom';
import { userDB } from '../utils/db';

export const getUserFromJwt = async (token: string) => {
  const user = jwt.verify(token, JWT_SECRET);

  const parsedUser = UserSchema.parse(user);

  const findedUser = await userDB.user.findUnique({
    where: { id: parsedUser.id },
  });

  if (!findedUser) throw unauthorized('Invalid token');

  return { user: parsedUser, token: token };
};

export const login = async (user: { email: string; password: string }) => {
  const getUser = await userDB.user.findUnique({
    where: { email: user.email },
  });

  if (!getUser) throw unauthorized('Invalid password/email');

  const decryptedPassword = bcrypt.compareSync(user.password, getUser.password);

  if (!decryptedPassword) {
    throw unauthorized('Invalid password/email');
  }

  const payload = {
    id: getUser.id,
    email: getUser.email,
    first_name: getUser.first_name,
    last_name: getUser.last_name,
  };

  const token = jwt.sign(payload, JWT_SECRET);

  return {
    user: payload,
    accessToken: token,
  };
};

export const generateInternalToken = (payload: User) => {
  const token = jwt.sign(payload, JWT_SECRET_INTERNAL);

  return token;
};
