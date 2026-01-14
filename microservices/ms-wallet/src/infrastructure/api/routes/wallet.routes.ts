import { FastifyInstance } from 'fastify';
import { WalletController } from '../controllers/WalletController';

export default async function walletRoutes(app: FastifyInstance) {
  const controller = new WalletController();

  app.get(
    '/api/wallet',
    { preHandler: [app.authenticate] },
    controller.getWallet.bind(controller)
  );

  app.get(
    '/api/wallet/balance',
    { preHandler: [app.authenticate] },
    controller.getBalance.bind(controller)
  );

  app.post(
    '/api/wallet/transactions',
    { preHandler: [app.authenticate] },
    controller.createTransaction.bind(controller)
  );
}
