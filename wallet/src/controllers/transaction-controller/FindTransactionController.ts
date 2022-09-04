import { Request, Response } from "express";
import { TransactionRepository } from "@repositories/transaction-repository/TransactionRepository";
import { FindTransactionService } from "@service/transaction-service/FindTransactionService";

type TransactionRequestProps = {
  type: "CREDIT" | "DEBIT";
};

export class FindTransactionController {
  async handle(request: Request, response: Response) {
    const { type } = request.query as TransactionRequestProps;

    const transactionRepository = new TransactionRepository();
    const transactionService = new FindTransactionService(transactionRepository);

    if (type === "CREDIT" || type === "DEBIT") {
      const FindTransactionResponse = await transactionService.execute(type);

      return response.status(200).json(FindTransactionResponse);
    } else {
      return response.status(400).json("Invalid transaction type.");
    }
  }
}
