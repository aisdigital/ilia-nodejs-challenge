import prisma from '../lib/prisma';

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UserOutput {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserRepository {
  async create(data: CreateUserInput): Promise<UserOutput> {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });

    return this.mapToOutput(user);
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<UserOutput | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user ? this.mapToOutput(user) : null;
  }

  private mapToOutput(user: any): UserOutput {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
