import {
  CreateUserRepositoryDto,
  UpdateUserRepositoryDto,
  UserDto,
} from '../dtos/user.dto';

export interface UserRepositoryInterface {
  create(data: CreateUserRepositoryDto): Promise<UserDto>;
  findById(id: string): Promise<UserDto | null>;
  findByEmail(email: string): Promise<UserDto | null>;
  findAll(): Promise<UserDto[]>;
  update(id: string, data: UpdateUserRepositoryDto): Promise<UserDto>;
  delete(id: string): Promise<void>;
}
