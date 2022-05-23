import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import BalanceController from '@/controllers/balance.controller';
import authMiddleware from '@/middlewares/auth.middleware';

class BalanceRoute implements Routes {
  public path = '/balance';
  public router = Router();
  public balanceController = new BalanceController();

  constructor() {
    this.initializeMiddlewareAuthentication();
    this.initializeRoutes();
  }

  private initializeMiddlewareAuthentication() {
    this.router.use(this.path, authMiddleware);
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.balanceController.getAmount);
  }
}

export default BalanceRoute;
