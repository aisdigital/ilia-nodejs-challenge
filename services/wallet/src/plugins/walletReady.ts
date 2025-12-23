import type { FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    walletReady: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(async (app) => {
  app.decorate("walletReady", async (req, reply) => {
    const userId = req.user?.sub;
    if (!userId) {
      return reply.code(401).send({ code: "UNAUTHORIZED", message: "Unauthorized" });
    }

    const result = await app.db.query("SELECT 1 FROM wallets WHERE user_id = $1", [userId]);
    if (result.rowCount === 0) {
      reply.header("Retry-After", "2");
      return reply.code(503).send({
        code: "WALLET_PROVISIONING",
        message: "Wallet is being provisioned. Retry shortly.",
      });
    }
  });
});
