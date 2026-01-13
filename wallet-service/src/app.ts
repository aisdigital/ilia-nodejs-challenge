import Fastify from "fastify";
import { registerJwt } from "./config/jwt.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";
import { walletRoutes } from "./modules/wallet/wallet.routes.js";

export async function buildApp() {
  const app = Fastify();

  await registerJwt(app);

  app.addHook("onRequest", authMiddleware);

  app.register(walletRoutes);

  return app;
}
