import { NextFunction, Request, Response} from 'express';
import transaction from '../database/models/transaction';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config({ path: __dirname+'/../../.env' });

const SECRET = process.env.PRIVATE_KEY;

export default {
    
    async verifyJWT(req: Request, res: Response, next: NextFunction) {
        const token = req.headers['x-acess-token'];
        jwt.verify(token as string, SECRET as any, (err : any, decoded : any) => {
            if(err) return res.status(401).json('invalid token');
            next();
        })
    },
}