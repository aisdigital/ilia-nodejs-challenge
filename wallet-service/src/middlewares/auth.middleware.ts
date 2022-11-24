import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv'
dotenv.config()

class AuthMiddleware {

    verifyJWT(request: Request, response: Response, next: NextFunction) {
        try {
            const token = request.headers.authorization?.replace("Bearer ", "");

            if (!token) {
                return response.status(401).send();
            }

            const secret = process.env.JWT_SECRET!;
            const data = jwt.verify(token, secret);

            if (!data) {
                return response.status(401).send();
            }

            return next();
        } catch (error) {
            return response.status(500).send();
        }
    }

}

export default AuthMiddleware;