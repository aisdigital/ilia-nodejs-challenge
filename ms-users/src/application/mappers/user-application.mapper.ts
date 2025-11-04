import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserDto } from '../dtos/user.dto';
import {
  CreateUserRepositoryDto,
  UpdateUserRepositoryDto,
  UserDto as DomainUserDto,
} from '../../domain/dtos/user.dto';
import { UserCreatedEvent } from '../../infrastructure/messaging/events/user-created.event';

export class UserApplicationMapper {
  static toCreateRepositoryDto(
    dto: CreateUserDto,
    hashedPassword: string,
  ): CreateUserRepositoryDto {
    return {
      id: uuidv4(),
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static toUpdateRepositoryDto(dto: UpdateUserDto): UpdateUserRepositoryDto {
    return {
      firstName: dto.firstName,
      lastName: dto.lastName,
      password: dto.password,
      updatedAt: new Date(),
    };
  }

  static toApplicationDto(user: DomainUserDto): UserDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toEvent(user: DomainUserDto): UserCreatedEvent {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
