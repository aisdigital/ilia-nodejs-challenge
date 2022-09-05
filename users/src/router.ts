import { AuthenticateUserController } from "@controller/user-controller/AuthenticateUserController";
import { FindUsersController } from "@controller/user-controller/FindUsersController";
import { FindUserController } from "@controller/user-controller/FindUserController";
import { CreateUserController } from "@controller/user-controller/CreateUserController";
import { UpdateUserController } from "@controller/user-controller/UpdateUserController";
import { DeleteUserController } from "@controller/user-controller/DeleteUserController";
import { FindAllBalancesUserController } from "@controller/user-controller/FindBalanceUserController";
import { SaveTransactionUserController } from "@controller/user-controller/SaveTransactionUserController";
import { FindUsersTransactiosService } from "@controller/user-controller/FindTransactionUserController";
import { verifyUserAuthentication } from "@middlewares/userAuthentication";
import { Router } from "express";

const router = Router();

// ! USERS TRANSACTIONS ROUTE
router.get("/users/findbalance", new FindAllBalancesUserController().handle);
router.get("/users/findtransactions/", new FindUsersTransactiosService().handle);
router.get("/users/savetransaction", new SaveTransactionUserController().handle);

// ! USERS ROUTE
router.get("/users/findusers", verifyUserAuthentication, new FindUsersController().handle);
router.get("/users/findtransactions", new FindAllBalancesUserController().handle);
router.get("/users/finduser/:id", verifyUserAuthentication, new FindUserController().handle);
router.post("/users/login", new AuthenticateUserController().handle);
router.post("/users/createuser", new CreateUserController().handle);
router.patch("/users/updateuser/:id", verifyUserAuthentication, new UpdateUserController().handle);
router.delete("/deleteuser/:id", verifyUserAuthentication, new DeleteUserController().handle);

export { router };
