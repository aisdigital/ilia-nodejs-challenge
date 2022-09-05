import { FindBalanceController } from "@controller/transaction-controller/FindBalanceController";
import { FindTransactionController } from "@controller/transaction-controller/FindTransactionController";
import { SaveTransactionController } from "@controller/transaction-controller/SaveTransactionController";
import { FindAllBalances } from "@controller/transaction-controller/FindAllBalancesController";
// import { verifyUserAuthentication } from "@middlewares/userAuthentication";
import { Router } from "express";

const router = Router();

// ! TRANSACTIONS ROUTE
router.get("/transactions/", new FindTransactionController().handle);
router.get("/transactions/balance", new FindBalanceController().handle);
router.get("/transactions/balance", new FindAllBalances().handle);
router.post("/transactions/post", new SaveTransactionController().handle);

export { router };
