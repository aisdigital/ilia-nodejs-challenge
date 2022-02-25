import axios from "axios";
import { WALLET } from "./consts";
const jwt = require("jsonwebtoken");

export const getTransactions = async (req: any, res: any) => {
  try {
    const tp: string = req.query.type;
    if (tp === undefined)
      return res.status(422).json({ message: "Missing 'type' parameter" });
    if (tp !== "CREDIT" && tp !== "DEBIT")
      return res.status(422).json({ message: "Wrong type of transaction" });
    const userId = req.params.id;
    const token = jwt.sign(userId, process.env.INT_JWT);

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.get(
      WALLET + `/transactions/${userId}?type=${tp}`,
      { headers: headers }
    );
    res.status(response.status).json(response.data);
    console.log(response);
  } catch (e) {
    res.status(500).json(e);
  }
};
