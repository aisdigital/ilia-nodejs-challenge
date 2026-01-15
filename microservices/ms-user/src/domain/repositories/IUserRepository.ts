import { User } from '../entities/User';

export interface CreateUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

export interface IUserRepository {
  create(data: CreateUserDTO): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(id: string, data: UpdateUserDTO): Promise<User>;
  delete(id: string): Promise<void>;
}
