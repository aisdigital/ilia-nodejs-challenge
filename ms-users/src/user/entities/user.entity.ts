import { User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;

  @Exclude()
  password: string;
}
