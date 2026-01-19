import { Injectable } from '@nestjs/common';
import { create } from 'domain';
import { PrismaService } from 'src/utils/prisma/prisma.service';
import { UserRequestDTO } from './dto/userRequest.dto';
import { User } from 'generated/prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: UserRequestDTO) {
    await this.prisma.user.create({
      data: {
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
      },
    });
  }

  async getAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      created_at: user.created_at,
    }));
  }

  async getOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async update(id: number, data: UserRequestDTO) {
    await this.prisma.user.update({
      data: {
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
      },
      where: {
        id,
      },
    });
  }

  async delete(id: number) {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
