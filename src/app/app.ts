import "dotenv/config";
import express from "express";
import { router } from "./router";

export const app = express();

app.use(express.json());
app.use("/api/v1/transactions/", router);
