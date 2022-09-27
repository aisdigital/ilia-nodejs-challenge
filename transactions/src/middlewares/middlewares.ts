import { NextFunction, Request, Response} from 'express';
import transaction from '../database/models/transaction';
import jwt from 'jsonwebtoken';

const SECRET = 'ILIACHALLENGE';

export default {
    
    async verifyJWT(req: Request, res: Response, next: NextFunction) {
        console.log(req.headers['x-acess-token']);
        const token = req.headers['x-acess-token'];
        jwt.verify(token as string, SECRET, (err : any, decoded : any) => {
            if(err) return res.status(401).json('invalid token');
            next();
        })
    },
}