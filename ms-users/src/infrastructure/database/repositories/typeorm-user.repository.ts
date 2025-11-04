import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateUserRepositoryDto,
  UpdateUserRepositoryDto,
  UserDto,
} from '../../../domain/dtos/user.dto';
import { UserRepositoryInterface } from '../../../domain/repositories/user.repository.interface';
import { UserOrmEntity } from '../entities/user.orm-entity';

@Injectable()
export class TypeOrmUserRepository implements UserRepositoryInterface {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  async create(data: CreateUserRepositoryDto): Promise<UserDto> {
    const ormEntity = this.toOrmEntity(data);
    const saved = await this.repository.save(ormEntity);
    return this.toDto(saved);
  }

  async findById(id: string): Promise<UserDto | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    return ormEntity ? this.toDto(ormEntity) : null;
  }

  async findByEmail(email: string): Promise<UserDto | null> {
    const ormEntity = await this.repository.findOne({ where: { email } });
    return ormEntity ? this.toDto(ormEntity) : null;
  }

  async findAll(): Promise<UserDto[]> {
    const ormEntities = await this.repository.find();
    return ormEntities.map((entity) => this.toDto(entity));
  }

  async update(id: string, data: UpdateUserRepositoryDto): Promise<UserDto> {
    await this.repository.update(id, data);
    const updated = await this.repository.findOne({ where: { id } });
    return this.toDto(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private toDto(ormEntity: UserOrmEntity): UserDto {
    return {
      id: ormEntity.id,
      firstName: ormEntity.firstName,
      lastName: ormEntity.lastName,
      email: ormEntity.email,
      password: ormEntity.password,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    };
  }

  private toOrmEntity(
    data: CreateUserRepositoryDto | UserDto,
  ): UserOrmEntity {
    const ormEntity = new UserOrmEntity();
    ormEntity.id = data.id;
    ormEntity.firstName = data.firstName;
    ormEntity.lastName = data.lastName;
    ormEntity.email = data.email;
    ormEntity.password = data.password;
    ormEntity.createdAt = data.createdAt;
    ormEntity.updatedAt = data.updatedAt;
    return ormEntity;
  }
}
