import { Injectable, Inject } from '@nestjs/common';
import type { UserRepositoryInterface } from '../../domain/repositories/user.repository.interface';
import { UserDto } from '../dtos/user.dto';
import { UserApplicationMapper } from '../mappers/user-application.mapper';

@Injectable()
export class GetAllUsersUseCase {
  constructor(
    @Inject('UserRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(): Promise<UserDto[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => UserApplicationMapper.toApplicationDto(user));
  }
}
