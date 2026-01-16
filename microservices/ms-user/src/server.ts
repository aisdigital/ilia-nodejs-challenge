import fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';

import { connectDB } from './infrastructure/database/sequelize';
import jwtPlugin from './infrastructure/api/plugins/jwt';
import routes from './infrastructure/api/routes';
import { startGrpcServer } from './infrastructure/grpc/userGrpcServer';
import { IUserRepository } from './domain/repositories/IUserRepository';
import { UserRepository } from './infrastructure/repositories/UserRepository';

dotenv.config();

const app = fastify({ logger: true });

const start = async (): Promise<void> => {
    try {
        await app.register(cors);
        await app.register(jwtPlugin);
        await app.register(routes);

        await connectDB();

        const userRepository: IUserRepository = new UserRepository();
        startGrpcServer(userRepository);

        const port = parseInt(process.env.PORT || '3002');
        const host = '0.0.0.0';

        await app.listen({ port, host });
        console.log(`User Microservice running on http://${host}:${port}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
