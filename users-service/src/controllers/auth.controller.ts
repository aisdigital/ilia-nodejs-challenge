import { Request, Response } from 'express';
import knex from "../db/knex";
import jwt from "jsonwebtoken";

class UsersController {
    async auth(request: Request, response: Response) {
        const user = await knex('users').select('id', 'first_name', 'last_name', 'email').where({ email: request.body.user.email, password: request.body.user.password }).first();

        if (!user) {
            return response.status(401).send();
        }

        const key = process.env.JWT_SECRET || 'key';
        const token = jwt.sign(request.body, key);
        return response.send({ user, access_token: token })
    }
}

export default UsersController;