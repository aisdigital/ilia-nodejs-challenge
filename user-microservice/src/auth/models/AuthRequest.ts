import { Request } from 'express';
import { User } from '@app/user/entities/user.entity';

export interface AuthRequest extends Request {
  user: User;
}
