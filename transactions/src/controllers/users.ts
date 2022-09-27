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
            return res.send(400).json('bad request');
        }
        const responseQuery = await user.userCreate(userParams);
        console.log(responseQuery);
        return res.sendStatus(200).json(responseQuery);
    }
};