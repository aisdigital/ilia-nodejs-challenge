import { getTransactions } from "./get-transactions";
import { getBalance } from "./get-balance";
import { postTransactions } from "./post-transactions";
const express = require("express");

const port = 3001;
const app = express();
app.post("/transactions", postTransactions);
app.get("/transactions", getTransactions);
app.get("/balance", getBalance);
app.listen(port);
