import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
// import knex from "../db/knex";

class UsersController {
    async get(request: Request, response: Response) {
        return response.send();
    };
}

export default UsersController;