import { Router } from 'express';
import UsersController from '../controllers/users.controller';
import AuthMiddleware from '../middlewares/auth.middleware';

const usersRouter = Router();
const usersController = new UsersController();
const authMiddleware = new AuthMiddleware();

usersRouter.get('/users', authMiddleware.verifyJWT, usersController.read)
usersRouter.get('/users/:id', authMiddleware.verifyJWT, usersController.readOne)
usersRouter.post('/users', usersController.create)
usersRouter.patch('/users/:id', authMiddleware.verifyJWT, usersController.update)
usersRouter.delete('/users/:id', authMiddleware.verifyJWT, usersController.delete)

export default usersRouter;