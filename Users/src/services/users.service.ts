import { hash } from 'bcrypt';
import { EntityRepository, Repository } from 'typeorm';
import { CreateUserDto } from '@dtos/users.dto';
import { UserEntity } from '@entities/users.entity';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { isEmpty } from '@utils/util';
import { MessengerService } from '@/interfaces/messengerService.interface';

@EntityRepository()
class UserService extends Repository<UserEntity> {
  constructor(private messengerService: MessengerService) {
    super();
  }

  public async findAllUser(): Promise<User[]> {
    const users: User[] = await UserEntity.find({ where: { activated: true } });
    return users;
  }

  public async findUserById(userId: string): Promise<User> {
    if (isEmpty(userId)) throw new HttpException(400, "You're not userId");

    const findUser: User = await UserEntity.findOne({ where: { id: userId, activated: true } });
    if (!findUser) throw new HttpException(409, "You're not user");

    return findUser;
  }

  public async createUser(userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await UserEntity.findOne({ where: { email: userData.email } });
    if (findUser && !findUser.activated) throw new HttpException(409, "You're not activated");
    if (findUser) throw new HttpException(409, `You're email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = await UserEntity.create({ ...userData, password: hashedPassword }).save();
    await this.messengerService.publish(createUserData);
    return createUserData;
  }

  public async patchUser(userId: string, userData: Object): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await UserEntity.findOne({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "You're not user");
    if (!findUser.activated) throw new HttpException(409, "You're not activated");

    const changedUser = await this.patchProperties(userData, findUser);
    await UserEntity.update(userId, changedUser);

    const updatedUser: User = await UserEntity.findOne({ where: { id: userId } });
    return updatedUser;
  }

  private async patchProperties(userData: Object, findUser: User): Promise<User> {
    const canModify = ['email', 'password', 'first_name', 'last_name'];
    const keys = Object.keys(userData);
    for (const key of keys) {
      if (!canModify.includes(key)) continue;
      if (key == 'password') userData['key'] = await hash(userData['key'], 10);
      findUser[key] = userData[key];
    }
    return findUser;
  }

  public async inactiveUser(userId: string): Promise<void> {
    if (isEmpty(userId)) throw new HttpException(400, "You're not userId");

    const findUser: User = await UserEntity.findOne({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "You're not user");

    findUser.activated = false;
    await UserEntity.update(userId, findUser);
    await this.messengerService.publish(findUser);
  }
}

export default UserService;
