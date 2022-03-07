import { Request, Response } from 'express';

import { container } from 'tsyringe';

import BalanceCalculator from '@modules/transactions/services/BalanceCalculator';

export default class BalanceController {
  public async getBalance(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const balanceCalculator = container.resolve(BalanceCalculator);

    const result = await balanceCalculator.execute();
    return response.json(result);
  }
}
