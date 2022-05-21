import { Router } from 'express';
import AuthController from '@controllers/auth.controller';
import { AuthUserDto } from '@dtos/auth.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';

class AuthRoute implements Routes {
  public path = '/auth';
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, validationMiddleware(AuthUserDto, 'body'), this.authController.logIn);
  }
}

export default AuthRoute;
