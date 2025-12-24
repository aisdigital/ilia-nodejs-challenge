import { User } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';

export interface GetUserByIdRequest {
  id: string;
}

export class GetUserByIdUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(request: GetUserByIdRequest): Promise<User> {
    const user = await this.userRepository.findById(request.id);
    
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}