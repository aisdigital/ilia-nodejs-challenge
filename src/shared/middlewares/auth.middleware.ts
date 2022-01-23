import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../helpers/response/error.response";
import jwt from 'jsonwebtoken'

const secretToken = process.env.SECRET_JWT_TOKEN

export function AuthMiddleware(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const header = request.headers["authorization"];

  if (!header) {
    throw new UnauthorizedError("Você precisar estar autenticado");
  }

  const parts = header.split(" ");

  if (parts.length !== 2) {
    throw new UnauthorizedError("Token inválido");
  }

  const [, token] = parts;

  if (!secretToken) return;

  jwt.verify(token, secretToken, (err, decode) => {
    if (err) {
      throw new UnauthorizedError("Token inválido");
    }

    response.locals["user"] = decode;
    next();
  });
}
