import { EntityRepository, Repository } from 'typeorm';
import { UserEntity } from '@/entities/users.entity';
import { User } from '@/interfaces/user.interface';
import { MessengerEntityService } from '@/interfaces/messengerEntityService.interface';

@EntityRepository()
class UserService extends Repository<UserEntity> implements MessengerEntityService {
  public async insertEntity(user: any): Promise<void> {
    console.log(`Inserting user`, user.id);

    let userEntity = await UserEntity.findOne(user.id);

    if (!userEntity) {
      userEntity = new UserEntity();
      userEntity.id = user.id;
    }

    userEntity.activated = user.activated;
    await UserEntity.save(userEntity);
  }
}

export default UserService;
