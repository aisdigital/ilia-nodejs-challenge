const dbConfig = require ('../config/database');
import mysql from 'mysql2';

let connection = mysql.createConnection(dbConfig.database);

interface user {
    firstName: string;
    lastName: string;
    email: string;
}

interface transaction {
    userId: Number;
    type: string;
    amount: Number;
}

interface transactionGet {
    userId: Number;
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
    },

    async CreateBalance(params: transaction) {

        let query = `
        INSERT INTO
            transactions
        (
        amount,
        type,
        user_fk_transaction_id
        )
            VALUES
        (`

        query+= (params.type == 'CREDIT' ? `${params.amount}` : `-${params.amount}`)

        query += `, '${params.type}',
        '${params.userId}'
        )
        `;

        console.log(query)
        connection.query(query, function (err, result, fields) {
            console.log(result);
            if (err) return err;
            if (result) return result;
            
        })
    },

    async getBalance(params: transactionGet) {

        let query = `
        SELECT
            SUM(amount) as balance
        FROM
            transactions
        WHERE
            user_fk_transaction_id = '${params.userId}'
        `;
        connection.query(query, function (err, result, fields) {
            console.log(result);
            if (err) return err;
            if (result) return result;
            
        })
    },

    async getTransactions(params: transactionGet) {
        
        let query = `
        SELECT
            amount AS value,
            type AS operation,
            created_at AS date
        FROM
            transactions
        WHERE
            user_fk_transaction_id = '${params.userId}'
        `;
        connection.query(query, function (err, result, fields) {
            console.log(result);
            if (err) return err;
            if (result) return result;
            
        })
    }

};