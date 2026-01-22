import argon2 from 'argon2';
import { User } from './user.model';
import { IUserRepository } from './user.repository.interface';
import { UpdateUserDTO, UserResponseDTO } from './user.schema';
import { UserNotFoundError } from '../../shared/errors/app-error';

export class UserService {
  constructor(private repository: IUserRepository) {}

  async findAll(): Promise<UserResponseDTO[]> {
    const users = await this.repository.findAll(false);
    return users.map((user) => this.sanitizeUser(user));
  }

  async findById(id: string): Promise<UserResponseDTO> {
    const user = await this.repository.findById(id, false);

    if (!user) {
      throw new UserNotFoundError();
    }

    return this.sanitizeUser(user);
  }

  async update(id: string, data: UpdateUserDTO): Promise<UserResponseDTO> {
    const user = await this.repository.findById(id, false);

    if (!user) {
      throw new UserNotFoundError();
    }

    const updateData: Partial<UpdateUserDTO> = { ...data };

    if (data.password) {
      updateData.password = await argon2.hash(data.password);
    }

    const updatedUser = await this.repository.update(id, updateData);

    if (!updatedUser) {
      throw new UserNotFoundError();
    }

    return this.sanitizeUser(updatedUser);
  }

  async delete(id: string): Promise<void> {
    const user = await this.repository.findById(id, false);

    if (!user) {
      throw new UserNotFoundError();
    }

    await this.repository.softDelete(id);
  }

  private sanitizeUser(user: User): UserResponseDTO {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
      updated_at: user.updated_at,
      deleted_at: user.deleted_at,
    };
  }
}
