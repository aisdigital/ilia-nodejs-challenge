import { Injectable } from '@nestjs/common';
import { UserRepository } from './users.repository';
import { UserRequestDTO } from './dto/userRequest.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(data: UserRequestDTO) {
    await this.userRepository.create(data);
  }

  async getAll() {
    return await this.userRepository.getAll();
  }

  async getOne(id: number) {
    return await this.userRepository.getOne(id);
  }

  async update(id: number, data: UserRequestDTO) {
    await this.userRepository.update(id, data);
  }

  async delete(id: number) {
    await this.userRepository.delete(id);
  }
}
