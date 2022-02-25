import { verifyToken } from "./utils";
import { addUser } from "./add-user";
import { getUsers } from "./get-users";
import { getOneUser } from "./get-one-user";
import { deleteUser } from "./delete-user";
import { updateUser } from "./update-user";
const express = require("express");

const port = 3002;
const app = express();
app.use(express.json());
app.post("/users", verifyToken, addUser);
app.get("/users", verifyToken, getUsers);
app.get("/users/:id", verifyToken, getOneUser);
app.patch("/users/:id", verifyToken, updateUser);
app.delete("/users/:id", verifyToken, deleteUser);
// app.post("/auth", sendToken);
app.use((req: any, res: any, next: any) => {
  res.status(404).send("<h1>Error 404</h1>\n<h1>Page not found</h1>");
});
app.listen(port);
