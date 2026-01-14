import { FastifyRequest, FastifyReply } from 'fastify';

export class HealthController {
  async check(request: FastifyRequest, reply: FastifyReply) {
    return {
      status: 'ok',
      service: 'wallet-microservice',
      timestamp: new Date().toISOString(),
    };
  }
}
