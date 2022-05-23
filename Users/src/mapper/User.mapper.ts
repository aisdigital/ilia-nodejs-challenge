import { User } from '@interfaces/users.interface';

export interface UserMapper {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export function mapUser(user: User): UserMapper {
  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
  } as UserMapper;
}
