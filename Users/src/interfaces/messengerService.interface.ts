import { User } from './users.interface';

export interface MessengerService {
  publish(user: User): Promise<void>;
}
