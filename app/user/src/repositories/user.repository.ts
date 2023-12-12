import { userDB } from '../utils/db';

export const userRepository = {
  getUserByEmail: (email: string) =>
    userDB.user.findUniqueOrThrow({ where: { email } }),
};
