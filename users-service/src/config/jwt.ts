import { FastifyInstance } from "fastify";
import fastifyJwt from '@fastify/jwt';
import { env } from "./env.js";

export async function registerJwt(app: FastifyInstance) {
  app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
  });
}
