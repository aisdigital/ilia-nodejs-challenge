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
const transaction_1 = __importDefault(require("../database/models/transaction"));
exports.default = {
    createTransaction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const transactionParams = {
                userId: req.body.userId,
                type: req.body.type,
                amount: req.body.amount
            };
            let verify = (req.body.userId && (req.body.type == 'CREDIT' || req.body.type == 'DEBIT') && req.body.amount);
            console.log(verify);
            if (!verify) {
                res.status(400).json('bad request');
            }
            const responseQuery = yield transaction_1.default.createTransaction(transactionParams);
            console.log(responseQuery);
            return res.status(200).json(responseQuery);
        });
    },
    getTransactions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const transactionGet = {
                userId: Number(req.params.id)
            };
            let verify = req.params.id;
            if (!verify) {
                return res.status(400).json('bad request');
            }
            const responseQuery = yield transaction_1.default.getTransactions(transactionGet);
            console.log('responsequery', responseQuery);
            return res.status(200).json(responseQuery);
        });
    }
};
