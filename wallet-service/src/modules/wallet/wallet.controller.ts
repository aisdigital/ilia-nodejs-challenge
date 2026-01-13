import { FastifyRequest, FastifyReply } from "fastify";
import { WalletService } from "./wallet.service.js";
import { CreateTransactionDTO } from "./dto/create-transaction.dto.js";
import { TransactionType } from "./entities/transaction.entity.js";

export class WalletController {
  constructor(private readonly service: WalletService) {}

  async createTransaction(
    request: FastifyRequest<{ Body: CreateTransactionDTO }>,
    reply: FastifyReply
  ) {
    await this.service.createTransaction(request.body);
    reply.code(201).send();
  }

  async listTransactions(
    request: FastifyRequest<{ Querystring: { type?: TransactionType; user_id?: string } }>,
    reply: FastifyReply
  ) {
    const type = request.query.type;
    const userId =
      request.query.user_id ??
      (request as any).user?.sub;

    const txs = await this.service.listTransactions(userId, type);
    reply.send(txs);
  }

  async getBalance(
    request: FastifyRequest<{ Querystring: { user_id?: string } }>,
    reply: FastifyReply
  ) {
    const userId =
      request.query.user_id ??
      (request as any).user?.sub;

    const balance = await this.service.getBalance(userId);
    reply.send({ balance });
  }
}
