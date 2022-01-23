import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../helpers/response/error.response";
import jwt from 'jsonwebtoken'

const internalSecretToken = process.env.INTERNAL_SECRET_JWT_TOKEN

export function InternalAuthMiddleware(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const header = request.headers["internal-authorization"] as string;

  if (!header) {
    throw new UnauthorizedError("Você precisa estar com autenticação interna");
  }

  const parts = header.split(" ");

  if (parts.length !== 2) {
    throw new UnauthorizedError("Token de autenticação internal inválido");
  }

  const [, token] = parts;

  if (!internalSecretToken) return;

  jwt.verify(token, internalSecretToken, (err, decode) => {
    if (err) {
      throw new UnauthorizedError("Token de autenticação internal inválido");
    }

    response.locals["user"] = decode;
    next();
  });
}
