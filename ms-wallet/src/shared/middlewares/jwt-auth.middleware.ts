import { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError } from '../errors/app-error';

export async function jwtAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch (error) {
    throw new UnauthorizedError('Invalid or missing authentication token');
  }
}