import { AuthenticateUserController } from "@controller/user-controller/AuthenticateUserController";
import { FindUsersController } from "@controller/user-controller/FindUsersController";
import { FindUserController } from "@controller/user-controller/FindUserController";
import { CreateUserController } from "@controller/user-controller/CreateUserController";
import { UpdateUserController } from "@controller/user-controller/UpdateUserController";
import { DeleteUserController } from "@controller/user-controller/DeleteUserController";
import { FindBalanceController } from "@controller/transaction-controller/FindBalanceController";
import { FindTransactionController } from "@controller/transaction-controller/FindTransactionController";
import { SaveTransactionController } from "@controller/transaction-controller/SaveTransactionController";
import { FindAllBalances } from "@controller/transaction-controller/FindAllBalancesController";
import { verifyUserAuthentication } from "../users/src/middlewares/userAuthentication";
import { Router } from "express";

const router = Router();

// ! USERS ROUTE
router.get("/users/findusers", verifyUserAuthentication, new FindUsersController().handle);
router.get("/users/finduser/:id", verifyUserAuthentication, new FindUserController().handle);
router.post("/users/login", new AuthenticateUserController().handle);
router.post("/users/createuser", new CreateUserController().handle);
router.patch("/users/updateuser/:id", verifyUserAuthentication, new UpdateUserController().handle);
router.delete("/deleteuser/:id", verifyUserAuthentication, new DeleteUserController().handle);

// ! TRANSACTIONS ROUTE
router.get("/transactions/", new FindTransactionController().handle);
router.get("/transactions/balance", new FindBalanceController().handle);
router.get("/transactions/balance", new FindAllBalances().handle);
router.post("/transactions/post", new SaveTransactionController().handle);

export { router };
