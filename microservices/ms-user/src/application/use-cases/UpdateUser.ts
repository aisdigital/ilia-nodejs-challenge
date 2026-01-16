import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { UserNotFoundError } from '../../domain/errors';
import bcrypt from 'bcrypt';

export interface UpdateUserInput {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

export class UpdateUser {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: UpdateUserInput): Promise<User> {
    const existingUser = await this.userRepository.findById(input.id);
    if (!existingUser) {
      throw new UserNotFoundError();
    }

    const updateData: any = {};
    if (input.firstName) updateData.firstName = input.firstName;
    if (input.lastName) updateData.lastName = input.lastName;
    if (input.email) updateData.email = input.email;
    if (input.password) {
      updateData.password = await bcrypt.hash(input.password, 10);
    }

    return await this.userRepository.update(input.id, updateData);
  }
}
