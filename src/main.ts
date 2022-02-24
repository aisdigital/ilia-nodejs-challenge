import { getTransactions } from "./get-transactions";
import { getBalance } from "./get-balance";
import { postTransactions } from "./post-transactions";
import { sendToken } from "./token";
import { MongoClient } from "mongodb";
import { verifyToken } from "./utils";
const express = require("express");

const port = 3001;
const app = express();
app.use(express.json());
app.post("/transactions", verifyToken, postTransactions);
app.get("/transactions", verifyToken, getTransactions);
app.get("/balance", verifyToken, getBalance);
app.post("/jwt", sendToken);
app.listen(port);

const hostDB = process.env.HOSTDB;
const portDB = process.env.PORTDB;

const uri = "mongodb://" + hostDB + ":" + portDB;

const client = new MongoClient(uri);
