import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../repository/database/database.service';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(private readonly database: DatabaseService) { }

  async insertOne(data): Promise<UserEntity> {
    return await this.database.user.create({ data });
  }

  async getMany(): Promise<Array<UserEntity>> {
    return await this.database.user.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  async getOneById(id: number): Promise<UserEntity> {
    return await this.database.user.findFirst({
      where: { id },
    });
  }

  async update(id: number, data): Promise<UserEntity> {
    return await this.database.user.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: number): Promise<UserEntity> {
    return await this.database.user.delete({
      where: { id },
    });
  }
}
