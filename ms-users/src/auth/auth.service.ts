import argon2 from 'argon2';
import { IUserRepository } from '../users/user.repository.interface';
import { CreateUserDTO, LoginDTO, UserResponseDTO, AuthResponseDTO } from '../users/user.schema';
import {
  DuplicateEmailError,
  InvalidCredentialsError,
  UserAlreadyDeletedException,
} from '../shared/errors';
import { User } from '../users/user.model';

export class AuthService {
  constructor(
    private userRepository: IUserRepository,
    private generateToken: (payload: { user_id: string }) => string,
  ) {}

  async register(data: CreateUserDTO): Promise<AuthResponseDTO> {
    const existingUser = await this.userRepository.findByEmail(data.email, true);

    if (existingUser) {
      if (existingUser.deleted_at) {
        throw new UserAlreadyDeletedException('This email belongs to a deleted account');
      }
      throw new DuplicateEmailError();
    }

    const hashedPassword = await argon2.hash(data.password);

    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    const token = this.generateToken({ user_id: user.id });

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  async login(data: LoginDTO): Promise<AuthResponseDTO> {
    const user = await this.userRepository.findByEmail(data.email, false);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await argon2.verify(user.password, data.password);

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const token = this.generateToken({ user_id: user.id });

    return {
      token,
      user: this.sanitizeUser(user),
    };
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
