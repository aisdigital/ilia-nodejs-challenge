import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from 'src/shared/database/repositories/users.repository';
import { hash } from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findUnique(userId: string) {
    const user = await this.usersRepository.findUnique({
      where: { id: userId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
      },
    });

    return user;
  }

  async findAll() {
    const users = await this.usersRepository.findAll();

    return users;
  }

  async update(userId: string, updateUserDto: UpdateUserDto) {
    const { firstName, lastName, email, password } = updateUserDto;

    let hashedPassword: string | undefined;

    if (password) {
      hashedPassword = await hash(password, 12);
    }

    return this.usersRepository.update({
      where: { id: userId },
      data: {
        first_name: firstName,
        last_name: lastName,
        email,
        ...(hashedPassword && { password: hashedPassword }),
      },
    });
  }

  async remove(userId: string) {
    await this.usersRepository.delete({
      where: { id: userId },
    });

    return null;
  }
}
