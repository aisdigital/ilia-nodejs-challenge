import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';
import { plainToClass } from 'class-transformer';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.userRepository.insertOne(createUserDto);
    return this.serializer(user);
  }

  async findAll() {
    const users = await this.userRepository.getMany();
    return users.map((user) => this.serializer(user));
  }

  async findOne(id: number) {
    const user = await this.userRepository.getOneById(id);
    return this.serializer(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userRepository.update(id, updateUserDto);
    return this.serializer(updatedUser);
  }

  async remove(id: number) {
    return await this.userRepository.delete(id);
  }

  serializer(user) {
    return plainToClass(UserEntity, user);
  }
}
