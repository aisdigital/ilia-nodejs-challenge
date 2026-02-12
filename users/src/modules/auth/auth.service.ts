import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from 'src/shared/database/repositories/users.repository';
import { AuthDto } from './dto/auth.dto';
import { compare, hash } from 'bcryptjs';
import { CreateUserDto } from '../../shared/dtos/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async signIn({ email, password }: AuthDto) {
    const user = await this.usersRepository.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const accessToken = await this.generateAccessToken(user.id);

    return { accessToken };
  }

  async signUp({ firstName, lastName, email, password }: CreateUserDto) {
    const emailTaken = await this.usersRepository.findUnique({
      where: { email },
      select: { id: true },
    });

    if (emailTaken) {
      throw new ConflictException('This email is already in use.');
    }

    const hashedPassword = await hash(password, 12);

    const user = await this.usersRepository.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email,
        password: hashedPassword,
      },
    });

    const accessToken = await this.generateAccessToken(user.id);

    return { accessToken };
  }

  private generateAccessToken(userId: string) {
    return this.jwtService.signAsync({ sub: userId });
  }
}
