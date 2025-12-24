import { User } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

export interface AuthenticateUserRequest {
  email: string;
  password: string;
}

export interface AuthenticateUserResponse {
  user: User;
  accessToken: string;
}

export class AuthenticateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private jwtSecret: string,
    private jwtExpiresIn: string = '24h'
  ) {}

  async execute(request: AuthenticateUserRequest): Promise<AuthenticateUserResponse> {
    const user = await this.userRepository.findByEmail(request.email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(request.password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const accessToken = jwt.sign(
      { 
        userId: user.id,
        email: user.email 
      },
      this.jwtSecret as jwt.Secret,
      { expiresIn: this.jwtExpiresIn } as jwt.SignOptions
    );

    return {
      user,
      accessToken
    };
  }
}