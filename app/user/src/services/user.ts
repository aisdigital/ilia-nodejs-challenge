import { badRequest } from '@hapi/boom';
import { UserRequestSchema, UserRequestSchemaType } from '../types/user';
import { userDB } from '../utils/db';
import bcrypt from 'bcrypt';

export const register = async (user: UserRequestSchemaType) => {
  const encryptedPassword = await bcrypt.hash(user.password, 10);

  return await userDB.user.create({
    data: {
      email: user.email,
      password: encryptedPassword,
      first_name: user.first_name,
      last_name: user.last_name,
    },
    select: {
      email: true,
      first_name: true,
      last_name: true,
      id: true,
    },
  });
};

export const getUsers = async () => {
  return await userDB.user.findMany({
    select: {
      email: true,
      first_name: true,
      last_name: true,
      id: true,
    },
  });
};

export const getUserById = async (id: string) => {
  return await userDB.user.findUnique({
    where: {
      id,
    },
    select: {
      email: true,
      first_name: true,
      last_name: true,
      id: true,
    },
  });
};

export const updateUser = async (
  user: UserRequestSchemaType & { id: string }
) => {
  const encryptedPassword = await bcrypt.hash(user.password, 10);

  return await userDB.user.update({
    where: {
      id: user.id,
    },
    data: {
      email: user.email,
      password: encryptedPassword,
      first_name: user.first_name,
      last_name: user.last_name,
    },
    select: {
      email: true,
      first_name: true,
      last_name: true,
      id: true,
    },
  });
};

export const deleteUser = (id: string) => userDB.user.delete({ where: { id } });
