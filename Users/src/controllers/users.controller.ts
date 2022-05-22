import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '@dtos/users.dto';
import { User } from '@interfaces/users.interface';
import UserService from '@services/users.service';
import { mapUser } from '@/mapper/User.mapper';
import MessengerUserService from '@/services/messenger.service';

class UsersController {
  readonly userService: UserService;

  constructor() {
    const messengerUserService = new MessengerUserService();
    this.userService = new UserService(messengerUserService);
  }

  public getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllUsersData: User[] = await this.userService.findAllUser();

      res.status(200).json(findAllUsersData.map(mapUser));
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.id;
      const findOneUserData: User = await this.userService.findUserById(userId);

      res.status(200).json(mapUser(findOneUserData));
    } catch (error) {
      next(error);
    }
  };

  public createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: CreateUserDto = req.body;
      const createUserData: User = await this.userService.createUser(userData);

      res.status(201).json(mapUser(createUserData));
    } catch (error) {
      next(error);
    }
  };

  public patchUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.id;
      const userData: CreateUserDto = req.body;
      const updateUserData: User = await this.userService.patchUser(userId, userData);

      res.status(200).json(mapUser(updateUserData));
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.id;
      await this.userService.inactiveUser(userId);

      res.status(200).send();
    } catch (error) {
      next(error);
    }
  };
}

export default UsersController;
