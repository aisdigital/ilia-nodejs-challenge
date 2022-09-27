const mysql = require('mysql2');
const migration = require('mysql-migrations');
const dotenv = require ('dotenv');

dotenv.config({ path: __dirname+'/../../.env' });


var connection = mysql.createPool({
    connectionLimit : 10,
    host     : process.env.DATABASE_HOST,
    user     : process.env.DB_USERNAME,
    password : process.env.DB_PASSWORD,
    database : process.env.DATABASE_NAME,
    port     : process.env.DATABASE_PORT_TRANSACTION
})

migration.init(connection, __dirname + '/migrations', function() {
    console.log('migrations finished')
});