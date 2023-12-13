import { UserSchema } from '../types/auth';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import bcrypt from 'bcrypt';
import { unauthorized } from '@hapi/boom';
import { userDB } from '../utils/db';

export const getUserFromJwt = (token: string) => {
  const user = jwt.verify(token, JWT_SECRET);

  return { user: UserSchema.parse(user), token: token };
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
