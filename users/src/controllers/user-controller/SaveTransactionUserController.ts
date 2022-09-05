import { Request, Response } from "express";
import axios from "axios";
import { API } from "@api/baseurl";

type TransactionUserRequest = {
  amount: number;
  type: "CREDIT" | "DEBIT";
};

export class SaveTransactionUserController {
  async handle(request: Request, response: Response) {
    const { amount, type } = request.body as TransactionUserRequest;

    try {
      const balances = await axios.post(`${API}/transactions/post`, { data: amount, type });
      const data = await balances.data;

      return response.status(200).json(data);
    } catch (err) {
      return response.status(500).json(err);
    }
  }
}
