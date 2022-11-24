import { Router } from 'express';
import UsersController from '../controllers/users.controller';

const usersRouter = Router();
const usersController = new UsersController();

usersRouter.get('/users', usersController.get)

export default usersRouter;