import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

type IPayload = {
  sub: string;
};

export function verifyUserAuthentication(request: Request, response: Response, next: NextFunction) {
  const authToken = request.headers.authorization;

  if (!authToken) {
    return response.status(401).json("Unauthorized!");
  }

  const [, token] = authToken.split(" ");

  try {
    const { sub } = verify(token, process.env.JWT_SECRET_TOKEN_USERS) as IPayload;
    request.body.id = sub;

    return next();
  } catch (err) {
    return response.status(401).json("Unauthorized!");
  }
}
