import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { UserRepositoryInterface } from '../../domain/repositories/user.repository.interface';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserDto } from '../dtos/user.dto';
import { UserApplicationMapper } from '../mappers/user-application.mapper';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('UserRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(id: string, dto: UpdateUserDto): Promise<UserDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData = { ...dto };
    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    const repositoryDto = UserApplicationMapper.toUpdateRepositoryDto(updateData);
    const updatedUser = await this.userRepository.update(id, repositoryDto);

    return UserApplicationMapper.toApplicationDto(updatedUser);
  }
}
