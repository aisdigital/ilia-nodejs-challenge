import { Request, Response } from "express";
import axios from "axios";
import { API } from "@api/baseurl";

type TransactionUserRequestProps = {
  type: "CREDIT" | "DEBIT";
};

export class FindUsersTransactiosService {
  async handle(request: Request, response: Response) {
    const { type } = request.query as TransactionUserRequestProps;

    try {
      const balances = await axios.get(`${API}/transactions/?type=${type}`);
      const data = await balances.data;
      return response.status(200).json(data);
    } catch (err) {
      return response.status(500).json(err);
    }
  }
}
