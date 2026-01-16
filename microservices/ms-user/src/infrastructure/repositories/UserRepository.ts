import {
  IUserRepository,
  CreateUserDTO,
  UpdateUserDTO,
} from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import UserModel from '../database/models/User.model';

export class UserRepository implements IUserRepository {
  async create(data: CreateUserDTO): Promise<User> {
    const userModel = await UserModel.create(data);
    return this.toDomain(userModel);
  }

  async findById(id: string): Promise<User | null> {
    const userModel = await UserModel.findByPk(id);
    if (!userModel) return null;
    return this.toDomain(userModel);
  }

  async findByEmail(email: string): Promise<User | null> {
    const userModel = await UserModel.findOne({ where: { email } });
    if (!userModel) return null;
    return this.toDomain(userModel);
  }

  async findAll(): Promise<User[]> {
    const users = await UserModel.findAll({
      order: [['createdAt', 'DESC']],
    });
    return users.map(this.toDomain);
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    await UserModel.update(data, { where: { id } });
    const updated = await this.findById(id);
    if (!updated) throw new Error('User not found after update');
    return updated;
  }

  async delete(id: string): Promise<void> {
    await UserModel.destroy({ where: { id } });
  }

  private toDomain(model: UserModel): User {
    return new User({
      id: model.id,
      firstName: model.firstName,
      lastName: model.lastName,
      email: model.email,
      password: model.password,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }
}
