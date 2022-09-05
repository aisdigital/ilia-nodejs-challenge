import cors from "cors";
import express from "express";
import { router } from "./router";

const app = express();

app.use(express.json());
app.use(router);
app.use(cors());

export { app };
