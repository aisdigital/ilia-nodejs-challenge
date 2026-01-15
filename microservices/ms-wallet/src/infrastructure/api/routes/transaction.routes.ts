import { FastifyInstance } from 'fastify';
import { TransactionController } from '../controllers/TransactionController';

export default async function transactionRoutes(app: FastifyInstance) {
    const controller = new TransactionController();

    app.post(
        '/transactions',
        { preHandler: [app.authenticate] },
        controller.create.bind(controller)
    );

    app.get(
        '/transactions',
        { preHandler: [app.authenticate] },
        controller.list.bind(controller)
    );

    app.get(
        '/balance',
        { preHandler: [app.authenticate] },
        controller.getBalance.bind(controller)
    );
}
