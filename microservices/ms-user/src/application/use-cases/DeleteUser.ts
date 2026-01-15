import { IUserRepository } from '../../domain/repositories/IUserRepository';

export interface DeleteUserInput {
  id: string;
}

export class DeleteUser {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: DeleteUserInput): Promise<void> {
    const user = await this.userRepository.findById(input.id);
    if (!user) {
      throw new Error('Error deleting user');
    }

    await this.userRepository.delete(input.id);
  }
}
