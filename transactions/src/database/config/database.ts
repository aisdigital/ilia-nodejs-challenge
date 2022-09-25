import * as dotenv from 'dotenv';

dotenv.config({ path: __dirname+'/../../../.env' })

export const database = {
    connectionLimit : 10,
    host     : process.env.DATABASE_HOST,
    user     : process.env.DB_USERNAME,
    password : process.env.DB_PASSWORD,
    database : process.env.DATABASE_NAME,
    port     : process.env.DATABASE_PORT_TRANSACTION
}