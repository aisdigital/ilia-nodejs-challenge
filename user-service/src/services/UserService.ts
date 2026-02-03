import jwt from 'jsonwebtoken';
import { hashPassword, comparePasswords } from '../lib/password';
import { UserRepository } from '../repositories/UserRepository';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';

const JWT_SECRET = process.env.JWT_SECRET || 'ILIACHALLENGE';

export interface AuthResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
}

export class UserService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  async register(data: RegisterInput): Promise<AuthResponse> {
    const existingUser = await this.repository.findByEmail(data.email);

    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await this.repository.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    const token = this.generateToken(user.id, user.email);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      token,
    };
  }

  async login(data: LoginInput): Promise<AuthResponse> {
    const user = await this.repository.findByEmail(data.email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const passwordMatch = await comparePasswords(data.password, user.password);

    if (!passwordMatch) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(user.id, user.email);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      token,
    };
  }

  private generateToken(userId: string, email: string): string {
    return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '24h' });
  }
}
