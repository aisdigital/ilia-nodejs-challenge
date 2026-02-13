import { User } from '../entities/User';

export abstract class IUserRepository {
  abstract save(user: User): Promise<void>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract exists(id: string): Promise<boolean>;
}