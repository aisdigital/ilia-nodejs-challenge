const dbConfig = require ('../config/database');
import mysql from 'mysql2';

let connection = mysql.createConnection(dbConfig.database);

interface transaction {
    userId: Number;
    type: string;
    amount: Number;
}

interface transactionGet {
    userId: Number;
}

export default {

    async createTransaction(params: transaction) {

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