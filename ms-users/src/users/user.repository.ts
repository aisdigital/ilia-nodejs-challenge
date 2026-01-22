import { User } from './user.model';
import { IUserRepository } from './user.repository.interface';

export class UserRepository implements IUserRepository {
  async create(data: Partial<User>): Promise<User> {
    return User.create(data as any);
  }

  async findByEmail(email: string, includeDeleted: boolean = false): Promise<User | null> {
    const where: any = { email };

    if (!includeDeleted) {
      where.deleted_at = null;
    }

    return User.findOne({ where });
  }

  async findById(id: string, includeDeleted: boolean = false): Promise<User | null> {
    const where: any = { id };

    if (!includeDeleted) {
      where.deleted_at = null;
    }

    return User.findOne({ where });
  }

  async findAll(includeDeleted: boolean = false): Promise<User[]> {
    const where: any = {};

    if (!includeDeleted) {
      where.deleted_at = null;
    }

    return User.findAll({
      where,
      order: [['created_at', 'DESC']],
    });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    
    if (!user) {
      throw new Error('User not found');
    }

    await user.update(data);
    return user;
  }

  async softDelete(id: string): Promise<void> {
    const user = await this.findById(id);
    
    if (!user) {
      throw new Error('User not found');
    }

    await user.update({ deleted_at: new Date() });
  }
}
