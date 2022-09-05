import { Request, Response } from "express";
import axios from "axios";
import { API } from "@api/baseurl";

export class FindAllBalancesUserController {
  async handle(request: Request, response: Response) {
    try {
      const balances = await axios.get(`${API}/transactions/balance`);
      const data = await balances.data;

      console.log(data);
      return response.status(200).json(data);
    } catch (err) {
      return response.status(500).json(err);
    }
  }
}
