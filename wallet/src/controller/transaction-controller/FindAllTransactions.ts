import { Request, Response } from "express";
import { TransactionRepository } from "@repositories/transaction-repository/TransactionRepository";
import { FindAllTransactionsService } from "@service/transaction-service/FindAllTransactions";

export class FindAllTransactions {
  async handle(request: Request, response: Response) {
    const transactionRepository = new TransactionRepository();
    const allTransactions = new FindAllTransactionsService(transactionRepository);

    const findBalanceResponse = await allTransactions.execute();

    try {
      return response.status(200).json(findBalanceResponse);
    } catch (err) {
      if (!findBalanceResponse) {
        return response.status(400).json("Invalid Data!");
      }

      return response.json(500).json(`Internal Error - ${err}`);
    }
  }
}
