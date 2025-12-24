import { User } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';

export interface UpdateUserRequest {
  id: string;
  firstName?: string;
  lastName?: string;
}

export class UpdateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(request: UpdateUserRequest): Promise<User> {
    const user = await this.userRepository.findById(request.id);
    
    if (!user) {
      throw new Error('User not found');
    }

    user.updateProfile(request.firstName, request.lastName);

    return await this.userRepository.update(user);
  }
}