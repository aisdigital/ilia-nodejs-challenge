import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/utils/prisma/prisma.service';
import { UserRequestDTO } from './dto/userRequest.dto';
import { User } from '../../generated/client';
import { PrismaWalletService } from 'src/utils/prisma/prismaWallet.service';

@Injectable()
export class UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletPrisma: PrismaWalletService,
  ) {}

  async create(data: UserRequestDTO) {
    let user: User | null = null;

    try {
      user = await this.prisma.user.create({
        data: {
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
        },
      });

      await this.walletPrisma.wallet.create({
        data: { user_id: user.id },
      });

      return user;
    } catch (error) {
      if (user) {
        try {
          await this.prisma.user.delete({
            where: { id: user.id },
          });
        } catch (deleteError) {
          throw new Error(
            'Failed to rollback user creation after wallet creation failure',
          );
        }
      }

      throw error;
    }
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
        first_name: data.first_name,
        last_name: data.last_name,
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
