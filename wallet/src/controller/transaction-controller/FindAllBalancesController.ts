import { Request, Response } from "express";
import { TransactionRepository } from "@repositories/transaction-repository/TransactionRepository";
import { FindAllBalancesService } from "@service/transaction-service/FindAllBalancesService";

export class FindAllBalances {
  async handle(request: Request, response: Response) {
    const transactionRepository = new TransactionRepository();
    const allBalances = new FindAllBalancesService(transactionRepository);

    const findBalanceResponse = await allBalances.execute();

    try {
      return response.status(200).json(findBalanceResponse);
    } catch (err) {
      if (!findBalanceResponse) {
        return response.status(400).json("Invalid Data!");
      }

      return response.json(500).json(`Internal Error! - ${err}`);
    }
  }
}
