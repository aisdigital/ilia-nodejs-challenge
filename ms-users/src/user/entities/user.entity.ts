import { User } from '@prisma/client';

export class UserEntity implements Omit<User, 'password'> {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}
