import axios from "axios";
import { WALLET } from "./consts";
const jwt = require("jsonwebtoken");

export const getBalance = async (req: any, res: any) => {
  try {
    const userId = req.params.id;
    const token = jwt.sign(userId, process.env.INT_JWT);

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.get(WALLET + `/balance/${userId}`, {
      headers: headers,
    });
    res.status(response.status).json(response.data);
    console.log(response);
  } catch (e) {
    res.status(500).json(e);
  }
};
