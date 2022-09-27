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
const balance_1 = __importDefault(require("../database/models/balance"));
exports.default = {
    getBalance(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const transactionGet = {
                userId: Number(req.params.id)
            };
            let verify = req.params.id;
            if (!verify) {
                res.send(400).json('bad request');
            }
            const responseQuery = yield balance_1.default.getBalance(transactionGet);
            console.log(responseQuery);
            res.send(responseQuery);
        });
    }
};
