import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      user_id: string;
    };
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      user_id: string;
    };
  }
}