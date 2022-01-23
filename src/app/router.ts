import { Router } from "express";
import { AuthMiddleware } from "../shared/middlewares/auth.middleware";
import { Controller } from "./controllers/controller";

export const router = Router();
const controller = new Controller();

router.get(
  "/list-by-type-user-id",
  AuthMiddleware,
  controller.findAllByTransactionTypeAndUserId
);
router.get("/balance", AuthMiddleware, controller.findBalance);
router.post("/save", AuthMiddleware, controller.store);
