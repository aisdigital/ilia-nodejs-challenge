import { PrismaClient } from "@prisma/client";
import { UserEntity } from "@entities/UserEntity";
import { IUserRepository } from "./IUserRepository";

export class UserRepository implements IUserRepository {
  async save(email: string, password: string, first_name: string, last_name: string): Promise<UserEntity> {
    return await new PrismaClient().user.create({
      data: {
        email,
        password,
        first_name,
        last_name,
      },
    });
  }

  async findByEmail(email: string): Promise<UserEntity> {
    return await new PrismaClient().user.findUnique({ where: { email } });
  }

  async findUsers(): Promise<UserEntity[]> {
    return await new PrismaClient().user.findMany();
  }

  async findUniqueUser(id: string): Promise<UserEntity> {
    return await new PrismaClient().user.findUnique({ where: { id } });
  }

  async updateUser(
    id: string,
    email: string,
    password: string,
    first_name: string,
    last_name: string
  ): Promise<UserEntity> {
    const update = await new PrismaClient().user.update({
      where: { id },
      data: { email, password, first_name, last_name },
    });

    return update;
  }
  async deleteUser(id: string): Promise<boolean> {
    try {
      await new PrismaClient().user.delete({ where: { id } });
      return true;
    } catch (err) {
      console.error("Failed in delete user...");
      return false;
    }
  }
}
