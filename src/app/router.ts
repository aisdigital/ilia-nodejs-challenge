import { Router } from "express";
import { Controller } from "./controllers/controller";

export const router = Router();
const controller = new Controller();

router.get(
  "/list-by-type-user-id",
  controller.findAllByTransactionTypeAndUserId
);
router.post("/save", controller.store);
