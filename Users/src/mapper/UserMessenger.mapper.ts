import { User } from '@interfaces/users.interface';

export interface UserMessenger {
  id: string;
  activated: boolean;
}

export function mapUserMessenger(user: User): UserMessenger {
  return {
    id: user.id,
    activated: user.activated,
  } as UserMessenger;
}
