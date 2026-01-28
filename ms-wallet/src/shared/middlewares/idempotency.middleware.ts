import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import { IdempotencyService, IdempotencyConflictError } from '../../modules/idempotency';

const IDEMPOTENCY_HEADER = 'idempotency-key';

let idempotencyService: IdempotencyService | null = null;

function getIdempotencyService(): IdempotencyService {
  if (!idempotencyService) {
    idempotencyService = new IdempotencyService();
  }
  return idempotencyService;
}

function extractUserId(request: FastifyRequest): string | null {
  const jwtUser = (request as any).user;
  if (jwtUser?.id) {
    return jwtUser.id;
  }

  const body = request.body as any;
  if (body?.user_id) {
    return body.user_id;
  }

  return null;
}

export async function idempotencyPreHandler(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (!['POST', 'PUT', 'PATCH'].includes(request.method)) {
    return;
  }

  const idempotencyKey = request.headers[IDEMPOTENCY_HEADER] as string;
  
  if (!idempotencyKey) {
    return;
  }

  const userId = extractUserId(request);
  if (!userId) {
    return;
  }

  const service = getIdempotencyService();

  try {
    const result = await service.checkAndRegister(
      idempotencyKey,
      userId,
      request.url,
      request.body as object
    );

    if (!result.isNew && result.existingResponse) {
      reply
        .status(result.existingResponse.status)
        .header('x-idempotent-replayed', 'true')
        .send(result.existingResponse.body);
      return;
    }

    (request as any).idempotencyKey = idempotencyKey;
  } catch (error) {
    if (error instanceof IdempotencyConflictError) {
      reply.status(409).send({
        error: 'Conflict',
        message: error.message,
      });
      return;
    }
    throw error;
  }
}

export async function idempotencyOnSend(
  request: FastifyRequest,
  reply: FastifyReply,
  payload: any
): Promise<any> {
  const idempotencyKey = (request as any).idempotencyKey;
  
  if (!idempotencyKey) {
    return payload;
  }

  const service = getIdempotencyService();

  try {
    const responseBody = typeof payload === 'string' ? JSON.parse(payload) : payload;
    
    await service.saveResponse(
      idempotencyKey,
      reply.statusCode,
      responseBody
    );
  } catch (error) {
    console.error('Failed to save idempotency response:', error);
  }

  return payload;
}

export function idempotencyPlugin(
  fastify: any,
  _options: any,
  done: HookHandlerDoneFunction
): void {
  fastify.addHook('preHandler', idempotencyPreHandler);
  fastify.addHook('onSend', idempotencyOnSend);

  done();
}

export async function cleanupExpiredIdempotencyKeys(): Promise<number> {
  const service = getIdempotencyService();
  return service.cleanupExpired();
}
