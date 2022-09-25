"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const transaction_1 = __importDefault(require("./controllers/transaction"));
const router = express_1.default.Router();
// transaction routes
router.post('/transaction', transaction_1.default.create);
router.get('/transaction', transaction_1.default.list);
// balance routes
// router.post('/balance', transactionsController);
exports.default = router;
