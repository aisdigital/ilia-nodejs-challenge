import Fastify from 'fastify';
import jwt from 'jsonwebtoken';
import { mustGetEnv, parseBearer, Errors, logger } from '@ilia/shared';

const port = Number(process.env.USERS_PORT || 3002);
const externalSecret = mustGetEnv('JWT_EXTERNAL_SECRET');

const app = Fastify({ logger: false });

app.setErrorHandler((err, req, reply) => {
  const status = err.statusCode || 500;
  reply.status(status).send({
    error: err.code || 'INTERNAL_ERROR',
    message: err.message || 'Internal Server Error',
  });
});

app.addHook('onRequest', async (req) => {
  // No foundation: tudo protegido por padrão.
  // No Incremento Users, abriremos /users (POST) e /auth como públicos.
  const token = parseBearer(req.headers.authorization);
  if (!token) throw Errors.unauthorized('Missing Bearer token');

  try {
    const payload = jwt.verify(token, externalSecret);
    req.user = payload;
  } catch {
    throw Errors.unauthorized('Invalid token');
  }
});

app.get('/status', async () => {
  return { ok: true, service: 'users' };
});

app.listen({ port, host: '0.0.0.0' })
  .then(() => logger.info(`users listening on ${port}`))
  .catch((e) => {
    logger.error(e);
    process.exit(1);
  });
