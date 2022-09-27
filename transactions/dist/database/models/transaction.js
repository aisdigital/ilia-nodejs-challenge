"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbConfig = require('../config/database');
const mysql2_1 = __importDefault(require("mysql2"));
let connection = mysql2_1.default.createConnection(dbConfig.database);
exports.default = {
    createTransaction(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = `
        INSERT INTO
            transactions
        (
        amount,
        type,
        user_fk_transaction_id
        )
            VALUES
        (`;
            query += (params.type == 'CREDIT' ? `${params.amount}` : `-${params.amount}`);
            query += `, '${params.type}',
        '${params.userId}'
        )
        `;
            connection.query(query, function (err, result, fields) {
                if (err)
                    return err;
                if (result)
                    return result;
            });
        });
    },
    getTransactions(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
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
                    console.log('result', result);
                    console.log('err', err);
                    if (err)
                        resolve(err);
                    if (result)
                        resolve(result);
                });
            });
        });
    }
};
