import { FastifyInstance } from "fastify";
import { WalletRepository } from "./wallet.repository.js";
import { WalletService } from "./wallet.service.js";
import { WalletController } from "./wallet.controller.js";

export async function walletRoutes(app: FastifyInstance) {
  const repository = new WalletRepository();
  const service = new WalletService(repository);
  const controller = new WalletController(service);

  app.post("/transactions", controller.createTransaction.bind(controller));
  app.get("/transactions", controller.listTransactions.bind(controller));

  app.get("/balance", controller.getBalance.bind(controller));
}
