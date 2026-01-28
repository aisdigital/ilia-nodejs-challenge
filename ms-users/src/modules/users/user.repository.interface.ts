import { User } from './user.model';

export interface IUserRepository {
  create(data: Partial<User>): Promise<User>;
  findByEmail(email: string, includeDeleted?: boolean): Promise<User | null>;
  findById(id: string, includeDeleted?: boolean): Promise<User | null>;
  findAll(includeDeleted?: boolean): Promise<User[]>;
  update(id: string, data: Partial<User>): Promise<User>;
  softDelete(id: string): Promise<void>;
}
