import { FastifyInstance, FastifyRequest } from 'fastify';
import fastifyRequestContext from '@fastify/request-context';
import { randomUUID } from 'crypto';

export async function registerRequestContext(app: FastifyInstance): Promise<void> {
  await app.register(fastifyRequestContext);

  app.addHook('onRequest', async (request: FastifyRequest) => {
    const requestId = (request.headers['x-request-id'] as string) || randomUUID();
    
    (request.requestContext as any).set('requestId', requestId);
    
    request.log = request.log.child({
      requestId,
      method: request.method,
      url: request.url,
    });
  });

  app.addHook('onSend', async (request, reply) => {
    const requestId = (request.requestContext as any).get('requestId');
    if (requestId) {
      reply.header('x-request-id', requestId);
    }
  });

  app.addHook('onResponse', async (request, reply) => {
    const requestId = (request.requestContext as any).get('requestId');
    const responseTime = reply.elapsedTime;

    request.log.info({
      type: 'http_response',
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: Math.round(responseTime),
      requestId,
    });
  });

  app.log.info('Request context and ID tracking registered');
}
