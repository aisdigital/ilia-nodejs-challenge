import { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError } from '../errors/app-error';

export async function jwtAuthMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch (error) {
    throw new UnauthorizedError('Invalid or missing authentication token');
  }
}