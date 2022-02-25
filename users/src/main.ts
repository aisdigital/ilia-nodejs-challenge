import { verifyToken } from "./utils";
import { addUser } from "./add-user";

const express = require("express");

const port = 3001;
const app = express();
app.use(express.json());
app.post("/users", verifyToken, addUser);
// app.get("/users", verifyToken, getTransactions);
// app.get("/users/:id", verifyToken, getBalance);
// app.patch("/users/:id", verifyToken, getBalance);
// app.delete("/users/:id", verifyToken, getBalance);
// app.post("/auth", sendToken);
app.use((req: any, res: any, next: any) => {
  res.status(404).send("<h1>Error 404</h1>\n<h1>Page not found</h1>");
});
app.listen(port);
