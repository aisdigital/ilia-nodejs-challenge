import { verifyToken } from "./utils";
import { addUser } from "./add-user";
import { getUsers } from "./get-users";
import { getOneUser } from "./get-one-user";
import { deleteUser } from "./delete-user";
import { updateUser } from "./update-user";
import { getToken } from "./token";
import { addTransaction } from "./add-transactions";
import { getTransactions } from "./get-transactions";
import { getBalance } from "./get-balance";
const express = require("express");

console.log(process.env.INT_JWT);

const port = 3002;
const app = express();
app.use(express.json());
app.post("/users", verifyToken, addUser);
app.get("/users", verifyToken, getUsers);
app.get("/users/:id", verifyToken, getOneUser);
app.patch("/users/:id", verifyToken, updateUser);
app.delete("/users/:id", verifyToken, deleteUser);
app.post("/auth", getToken);
app.get("/transactions/:id", verifyToken, getTransactions);
app.get("/balance/:id", verifyToken, getBalance);
app.post("/transactions", verifyToken, addTransaction);
app.use((req: any, res: any, next: any) => {
  res.status(404).send("<h1>Error 404</h1>\n<h1>Page not found</h1>");
});
app.listen(port);
