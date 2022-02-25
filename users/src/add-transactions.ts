import axios from "axios";
import { WALLET } from "./consts";
import { isTransaction } from "./utils";
const jwt = require("jsonwebtoken");

export const addTransaction = async (req: any, res: any) => {
  try {
    const request = req.body;
    if (!isTransaction(request))
      return res.status(422).json({ message: "Wrong body format" });
    const token = jwt.sign(request.id, process.env.INT_JWT);

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.post(
      WALLET + `/transactions/${request.user_id}`,
      request,
      { headers: headers }
    );
    res.status(response.status).json(response.data);
    console.log(response);
  } catch (e) {
    res.status(500).json(e);
  }
};
