import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { config } from '../../config';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      id: string;
      email: string;
      [key: string]: any;
    };
  }
}

async function jwtPlugin(fastify: FastifyInstance) {
  fastify.register(jwt, {
    secret: config.jwt.secret,
  });

  fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized', message: 'Invalid or missing token' });
    }
  });
}

export default fp(jwtPlugin);
