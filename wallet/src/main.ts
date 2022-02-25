import { getTransactions } from "./get-transactions";
import { getBalance } from "./get-balance";
import { postTransactions } from "./post-transactions";
import { sendToken } from "./token";
import { MongoClient } from "mongodb";
import { verifyToken } from "./utils";
const express = require("express");

console.log(process.env.HOSTDB);
console.log(process.env.PORTDB);

const port = 3001;
const app = express();
app.use(express.json());
app.post("/transactions", verifyToken, postTransactions);
app.get("/transactions", verifyToken, getTransactions);
app.get("/balance", verifyToken, getBalance);
// app.post("/signup", sendToken);
app.use((req: any, res: any, next: any) => {
  res.status(404).send("<h1>Error 404</h1>\n<h1>Page not found</h1>");
});
app.listen(port);
