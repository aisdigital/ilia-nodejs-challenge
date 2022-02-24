import { getTransactions } from "./get-transactions";
import { getBalance } from "./get-balance";
import { postTransactions } from "./post-transactions";
import { getToken } from "./token";
import { MongoClient } from "mongodb";
const express = require("express");

const port = 3001;
const app = express();
app.use(express.json());
app.post("/transactions", postTransactions);
app.get("/transactions", getTransactions);
app.get("/balance", getBalance);
app.post("/jwt", getToken);
app.listen(port);

const hostDB = process.env.HOSTDB;
const portDB = process.env.PORTDB;

const uri = "mongodb://" + hostDB + ":" + portDB;

const client = new MongoClient(uri);
