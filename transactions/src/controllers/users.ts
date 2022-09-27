import { Request, Response} from 'express';
import user from '../database/models/users';
import crypto, { Cipher } from 'crypto';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';


dotenv.config({ path: __dirname+'/../../.env' })


const key = process.env.CRYPTO_PASS;
const SECRET = process.env.PRIVATE_KEY;

let algorithm = 'aes-192-cbc';
let iv = '1234567890123456';

export default {
    async userCreate(req: Request, res: Response) {
        console.log(req.body.password)
        
        // encriptar password
        const cipher = crypto.createCipheriv(algorithm, Buffer.from(key as any), iv);
        var encrypted = cipher.update(req.body.password, 'utf8', 'hex') + cipher.final('hex');

        const userParams = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: encrypted
        }

        console.log(userParams);
        let verify = (userParams.firstName && userParams.lastName && userParams.email && userParams.password)
        
        if (!verify) {
            return res.status(400).json('bad request');
        }
        const responseQuery = await user.userCreate(userParams);
        console.log(responseQuery);
        if(responseQuery) {
            return res.status(200).json('Usuário criado com sucesso');
        }
        return res.status(400).json('bad request');
    },

    async usersGet(req: Request, res: Response) {
        console.log(req.body.password)
        
        const responseQuery = await user.usersGet();
        console.log(responseQuery);
        if(responseQuery) {
            return res.status(200).json(responseQuery);
        }
        return res.status(400).json('bad request');
    },
    
    async login(req: Request, res: Response) {

        let password = req.body.password;

        const userParams = {
            email: req.body.email,
        }
        
        const responseQuery : any = await user.findUserByEmail(userParams);
        let text = responseQuery[0].password;
        
        const decipher = crypto.createDecipheriv(algorithm, key as any, iv);
        var decrypted = decipher.update(text, 'hex', 'utf8') + decipher.final('utf8'); //deciphered text
        
        if (decrypted == password) {
            const token = jwt.sign({ email: userParams.email}, SECRET as any, {expiresIn: 3000})
            return res.status(200).json({ auth: true, token });
        }
        return res.status(401).json('unauthorized');
    }
};