import { NextFunction, Request, Response } from 'express';
import BalanceService from '@/services/balance.service';
import { Amount } from '@/interfaces/balance.interface';

class BalanceController {
  public balanceService = new BalanceService();

  public getAmount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const amount: Amount = await this.balanceService.calculateAmount();
      res.status(200).json(amount);
    } catch (error) {
      next(error);
    }
  };
}

export default BalanceController;
