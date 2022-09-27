"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const transaction_1 = __importDefault(require("./controllers/transaction"));
const users_1 = __importDefault(require("./controllers/users"));
const balance_1 = __importDefault(require("./controllers/balance"));
const router = express_1.default.Router();
// user routes
router.post('/user', users_1.default.userCreate);
// transaction routes
router.post('/transaction', transaction_1.default.createTransaction);
router.get('/transaction/:id', transaction_1.default.getTransactions);
// balance routes
router.get('/balance', balance_1.default.getBalance);
exports.default = router;
