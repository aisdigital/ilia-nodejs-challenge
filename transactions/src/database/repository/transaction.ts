const dbConfig = require ('../config/database');
import mysql from 'mysql2';

let connection = mysql.createConnection(dbConfig.database);

interface user {
    username?: string;
}

export default {
    async create(params: user) {
        console.log('executoooooooou')
        let query = `
        INSERT INTO
        NewTable
        (
        name
        )
        VALUES
        (
        'junior'
        )
        `;
        connection.query(query, function (err, result, fields) {
            console.log(err);
            console.log(result);
            if (err) return err;
            if (result) return result;
            
        })
    },

    async update(params: user) {
        
    },

    async list(params: user) {
        
    },

    async delete(req: Request, res: Response) {
        
    }

};