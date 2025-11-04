import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { UserRepositoryInterface } from '../../domain/repositories/user.repository.interface';
import { UserDto } from '../dtos/user.dto';
import { UserApplicationMapper } from '../mappers/user-application.mapper';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject('UserRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(id: string): Promise<UserDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return UserApplicationMapper.toApplicationDto(user);
  }
}
