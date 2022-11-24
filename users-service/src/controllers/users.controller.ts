import { Request, Response } from 'express';
import knex from "../db/knex";

class UsersController {
    async read(request: Request, response: Response) {
        const users = await knex.select('id', 'first_name', 'last_name', 'email').from('users');
        return response.send(users);
    };

    async readOne(request: Request, response: Response) {
        const users = await knex.select('id', 'first_name', 'last_name', 'email').from('users').where({ id: request.params.id }).first();
        return response.send(users);
    };

    async create(request: Request, response: Response) {
        try {
            await knex('users').insert(request.body);
            const user = await knex('users').select('id', 'first_name', 'last_name', 'email').from('users').where({id: request.body.id }).first();
            return response.send(user);
        } catch (error) {
            console.log(error);
            return response.status(500).send();
        }
    };

    async update(request: Request, response: Response) {
        try {
            await knex('users').update(request.body).where({ id: request.params.id });
            const user = await knex('users').select('id', 'first_name', 'last_name', 'email').from('users').where({id: request.params.id }).first();
            return response.send(user);
        } catch (error) {
            console.log(error);
            return response.status(500).send();
        }
    };

    async delete(request: Request, response: Response) {
        try {
            await knex('users').where({ id: request.params }).del();
            return response.send();
        } catch (error) {
            console.log(error);
            return response.status(500).send();
        }
    };
}

export default UsersController;