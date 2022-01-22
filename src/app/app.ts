import "dotenv/config";
import express, { Request, Response } from "express";

export const app = express();

app.use(express.json());

app.get("/", (resquest: Request, response: Response) => {
  response.status(200).json({ message: "Hello world!" });
});
