import { TransactionController } from "src/controllers/TransactionController";
import { Router } from "express";

const router = Router();

router.post("/transactions", new TransactionController().handle);

router.get("/transactions", (req, res) => {
  res.json("transactions GET sucess").status(200);
});

router.get("/balance", (req, res) => {
  res.json("balance GET sucess").status(200);
});

export { router };
