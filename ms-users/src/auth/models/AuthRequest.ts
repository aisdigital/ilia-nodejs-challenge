import { Request } from 'express';
import { UserEntity } from '../../user/entities/user.entity';

export interface AuthRequest extends Request {
  user: UserEntity;
}
