import { Router } from 'express';
import UsersController from '@controllers/users.controller';
import { CreateUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';

class UsersRoute implements Routes {
  public path = '/users';
  public router = Router();
  public usersController = new UsersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, validationMiddleware(CreateUserDto, 'body'), this.usersController.createUser);
    this.router.get(`${this.path}`, this.usersController.getUsers);
    this.router.get(`${this.path}/:id(\\w+)`, this.usersController.getUserById);
    this.router.patch(`${this.path}/:id(\\w+)`, validationMiddleware(CreateUserDto, 'body', true), this.usersController.patchUser);
    this.router.delete(`${this.path}/:id(\\w+)`, this.usersController.deleteUser);
  }
}

export default UsersRoute;
