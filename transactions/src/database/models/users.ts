const dbConfig = require ('../config/database');
import mysql from 'mysql2';

let connection = mysql.createConnection(dbConfig.database);

interface user {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

interface email {
    email: string;
}

export default {

    async userCreate(params: user) {
        return new Promise((resolve, reject) => {
            let query = `
            INSERT INTO
                users
            (
            first_name,
            last_name,
            email,
            password
            )
                VALUES
            (
            '${params.firstName}',
            '${params.lastName}',
            '${params.email}',
            '${params.password}'
            )
            `;
            connection.query(query, function (err, result, fields) {
                if (err) reject(err);
                if (result) resolve(result);
                
            })
        })
    },

    async findUserByEmail(params: email) {
        return new Promise((resolve, reject) => {
            let query = `
            SELECT
                id,
                first_name AS name,
                last_name AS nickname,
                email,
                password
            FROM
                users
            WHERE
                email = '${params.email}'
            LIMIT 1
            `;
            connection.query(query, function (err, result, fields) {
                if (err) reject(err);
                if (result) resolve(result);
                
            })
        })
    }

};