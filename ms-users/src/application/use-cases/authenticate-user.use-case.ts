import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { UserRepositoryInterface } from '../../domain/repositories/user.repository.interface';
import { AuthDto } from '../dtos/auth.dto';
import { UserDto } from '../dtos/user.dto';
import { UserApplicationMapper } from '../mappers/user-application.mapper';

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    @Inject('UserRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(dto: AuthDto): Promise<UserDto> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return UserApplicationMapper.toApplicationDto(user);
  }
}
