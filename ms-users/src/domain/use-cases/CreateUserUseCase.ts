import { User } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';
import bcrypt from 'bcrypt';

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(request: CreateUserRequest): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(request.password, saltRounds);

    const user = User.create({
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      password: hashedPassword
    });

    return await this.userRepository.save(user);
  }
}