import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

export interface GetUserInput {
  id: string;
}

export class GetUser {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: GetUserInput): Promise<User> {
    const user = await this.userRepository.findById(input.id);
    if (!user) {
      throw new Error('Error geting user');
    }
    return user;
  }
}
