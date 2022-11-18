import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@shared/prisma/prisma.service';
import { CreateUserDto } from './dtos/createUser.dto';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dtos/updateUser.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
    return {
      ...updatedUser,
      password: undefined,
    };
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email } = createUserDto;
    const verifyIfExists = await this.findByEmail(email);
    if (verifyIfExists) {
      throw new ConflictException('user already exists');
    }
    const data: Prisma.UserCreateInput = {
      ...createUserDto,
      password: await bcrypt.hash(createUserDto.password, 10),
    };

    const createdUser = await this.prisma.user.create({ data });

    return {
      ...createdUser,
      password: undefined,
    };
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
