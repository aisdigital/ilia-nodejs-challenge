import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(createUserDto: Prisma.UserCreateArgs) {
    return this.prismaService.user.create(createUserDto);
  }

  findAll() {
    return this.prismaService.user.findMany();
  }

  findUnique(findUniqueUserDto: Prisma.UserFindUniqueArgs) {
    return this.prismaService.user.findUnique(findUniqueUserDto);
  }

  update(updateUserDto: Prisma.UserUpdateArgs) {
    return this.prismaService.user.update(updateUserDto);
  }

  delete(deleteUserDto: Prisma.UserDeleteArgs) {
    return this.prismaService.user.delete(deleteUserDto);
  }
}
