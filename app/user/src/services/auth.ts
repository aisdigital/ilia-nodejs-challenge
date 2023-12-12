import { UserSchema } from '../types/auth';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { userRepository } from '../repositories/user.repository';
import bcrypt from 'bcrypt';
import { unauthorized } from '@hapi/boom';

export const getUserFromJwt = (token: string) => {
  const user = jwt.verify(token, JWT_SECRET);

  return { user: UserSchema.parse(user), token: token };
};

export const login = async (user: { email: string; password: string }) => {
  const getUser = await userRepository.getUserByEmail(user.email);

  const decryptedPassword = bcrypt.compareSync(user.password, getUser.password);

  if (!decryptedPassword) {
    throw unauthorized('Invalid password/email');
  }

  const payload = {
    id: getUser.id,
    email: getUser.email,
    firstName: getUser.firstName,
    lastName: getUser.lastName,
  };

  const token = jwt.sign(payload, JWT_SECRET);

  return {
    user: payload,
    accessToken: token,
  };
};
