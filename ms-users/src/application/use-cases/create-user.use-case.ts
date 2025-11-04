import { Injectable, Inject, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { UserRepositoryInterface } from '../../domain/repositories/user.repository.interface';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserDto } from '../dtos/user.dto';
import { KafkaProducerService } from '../../infrastructure/messaging/kafka-producer.service';
import { UserApplicationMapper } from '../mappers/user-application.mapper';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('UserRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async execute(dto: CreateUserDto): Promise<UserDto> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const userToCreate = UserApplicationMapper.toCreateRepositoryDto(
      dto,
      hashedPassword,
    );

    const savedUser = await this.userRepository.create(userToCreate);

    const event = UserApplicationMapper.toEvent(savedUser);
    await this.kafkaProducer.publish('user-events', event);

    return UserApplicationMapper.toApplicationDto(savedUser);
  }
}
