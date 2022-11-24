import { Router } from 'express';
import UsersController from '../controllers/users.controller';

const usersRouter = Router();
const usersController = new UsersController();

usersRouter.get('/users', usersController.read)
usersRouter.get('/users/:id', usersController.readOne)
usersRouter.post('/users', usersController.create)
usersRouter.patch('/users/:id', usersController.update)
usersRouter.delete('/users/:id', usersController.delete)

export default usersRouter;