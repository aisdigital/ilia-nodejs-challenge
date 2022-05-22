import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import TransactionsController from '@/controllers/transactions.controller';
import { CreateTransactionDto } from '@/dtos/transactions.dto';

class TransactionsRoute implements Routes {
  public path = '/transactions';
  public router = Router();
  public transactionsController = new TransactionsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/`, this.transactionsController.getTransactionByType);
    this.router.post(`${this.path}`, validationMiddleware(CreateTransactionDto, 'body'), this.transactionsController.createTransaction);
  }
}

export default TransactionsRoute;
