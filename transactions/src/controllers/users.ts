import { Request, Response} from 'express';
import user from '../database/models/users';

export default {
    async userCreate(req: Request, res: Response) {
        const userParams = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email
        }
        let verify = (userParams.firstName && userParams.lastName && userParams.email)
        
        if (!verify) {
            return res.status(400).json('bad request');
        }
        const responseQuery = await user.userCreate(userParams);
        console.log(responseQuery);
        if(responseQuery) {
            return res.status(200).json('Usuário criado com sucesso');
        }
        return res.status(400).json('bad request');
    }
};