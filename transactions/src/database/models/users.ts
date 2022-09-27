const dbConfig = require ('../config/database');
import mysql from 'mysql2';

let connection = mysql.createConnection(dbConfig.database);

interface user {
    firstName: string;
    lastName: string;
    email: string;
}

export default {

    async userCreate(params: user) {

        let query = `
        INSERT INTO
            users
        (
        first_name,
        last_name,
        email
        )
            VALUES
        (
        '${params.firstName}',
        '${params.lastName}',
        '${params.email}'
        )
        `;
        connection.query(query, function (err, result, fields) {
            console.log(err);
            console.log(result);
            if (err) return err;
            if (result) return result;
            
        })
    }

};