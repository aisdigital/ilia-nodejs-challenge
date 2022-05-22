import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import BalanceController from '@/controllers/balance.controller';

class BalanceRoute implements Routes {
  public path = '/balance';
  public router = Router();
  public balanceController = new BalanceController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/`, this.balanceController.getAmount);
  }
}

export default BalanceRoute;
