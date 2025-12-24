import { UserRepository } from '../repositories/UserRepository';

export interface DeleteUserRequest {
  id: string;
}

export class DeleteUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(request: DeleteUserRequest): Promise<void> {
    const user = await this.userRepository.findById(request.id);
    
    if (!user) {
      throw new Error('User not found');
    }

    const deleted = await this.userRepository.delete(request.id);
    
    if (!deleted) {
      throw new Error('Failed to delete user');
    }
  }
}