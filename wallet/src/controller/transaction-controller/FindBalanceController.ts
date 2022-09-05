import { Request, Response } from "express";
import { TransactionRepository } from "@repositories/transaction-repository/TransactionRepository";
import { FindBalanceService } from "@service/transaction-service/FindBalanceService";

type TransactionRequestBalanceProps = {
  user_id: string;
};

export class FindBalanceController {
  async handle(request: Request, response: Response) {
    const { user_id } = request.query as TransactionRequestBalanceProps;

    const transactionRepository = new TransactionRepository();
    const transactionService = new FindBalanceService(transactionRepository);

    const findBalanceResponse = await transactionService.execute(user_id);

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
