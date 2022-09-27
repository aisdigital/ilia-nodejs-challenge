const dbConfig = require ('../config/database');
import mysql from 'mysql2';

let connection = mysql.createConnection(dbConfig.database);

interface transactionGet {
    userId: Number;
}

export default {

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
    }

};