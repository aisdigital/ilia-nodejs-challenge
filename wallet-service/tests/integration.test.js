"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("../src/lib/prisma"));
const validate_1 = require("../src/middleware/validate");
const transaction_schema_1 = require("../src/schemas/transaction.schema");
const JWT_SECRET = 'ILIACHALLENGE';
const USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const createApp = () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    const authenticate = (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ error: 'Missing authorization header' });
            return;
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ error: 'Missing token' });
            return;
        }
        try {
            req.user = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            next();
        }
        catch (error) {
            res.status(401).json({ error: 'Invalid or expired token' });
        }
    };
    app.post('/transactions', authenticate, (0, validate_1.validate)(transaction_schema_1.createTransactionSchema), async (req, res) => {
        try {
            const validatedData = req.body;
            const userId = req.user?.id;
            const transaction = await prisma_1.default.transaction.create({
                data: {
                    userId,
                    type: validatedData.type,
                    amount: validatedData.amount,
                },
            });
            res.status(200).json({
                id: transaction.id,
                user_id: transaction.userId,
                type: transaction.type,
                amount: transaction.amount,
                createdAt: transaction.createdAt,
                updatedAt: transaction.updatedAt,
            });
        }
        catch (error) {
            console.error('Error creating transaction:', error);
            res.status(500).json({ error: 'Failed to create transaction' });
        }
    });
    app.get('/balance', authenticate, async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            const groupedTransactions = await prisma_1.default.transaction.groupBy({
                by: ['type'],
                where: { userId },
                _sum: { amount: true },
            });
            const creditSum = groupedTransactions
                .find((group) => group.type === 'CREDIT')?._sum.amount || 0;
            const debitSum = groupedTransactions
                .find((group) => group.type === 'DEBIT')?._sum.amount || 0;
            const balance = creditSum - debitSum;
            res.status(200).json({ amount: balance });
        }
        catch (error) {
            console.error('Error calculating balance:', error);
            res.status(500).json({ error: 'Failed to calculate balance' });
        }
    });
    return app;
};
describe('Wallet Integration - Transaction Flow', () => {
    let app;
    let validToken;
    beforeAll(() => {
        app = createApp();
        validToken = jsonwebtoken_1.default.sign({ id: USER_ID }, JWT_SECRET);
    });
    beforeEach(async () => {
        await prisma_1.default.transaction.deleteMany({
            where: { userId: USER_ID },
        });
    });
    afterAll(async () => {
        await prisma_1.default.transaction.deleteMany({
            where: { userId: USER_ID },
        });
        await prisma_1.default.$disconnect();
    });
    it('should create transactions and calculate balance correctly', async () => {
        const creditResponse1 = await (0, supertest_1.default)(app)
            .post('/transactions')
            .set('Authorization', `Bearer ${validToken}`)
            .send({ amount: 1000, type: 'CREDIT' });
        expect(creditResponse1.status).toBe(200);
        expect(creditResponse1.body).toHaveProperty('id');
        expect(creditResponse1.body.amount).toBe(1000);
        expect(creditResponse1.body.type).toBe('CREDIT');
        const creditResponse2 = await (0, supertest_1.default)(app)
            .post('/transactions')
            .set('Authorization', `Bearer ${validToken}`)
            .send({ amount: 1000, type: 'CREDIT' });
        expect(creditResponse2.status).toBe(200);
        expect(creditResponse2.body.amount).toBe(1000);
        expect(creditResponse2.body.type).toBe('CREDIT');
        const debitResponse = await (0, supertest_1.default)(app)
            .post('/transactions')
            .set('Authorization', `Bearer ${validToken}`)
            .send({ amount: 500, type: 'DEBIT' });
        expect(debitResponse.status).toBe(200);
        expect(debitResponse.body.amount).toBe(500);
        expect(debitResponse.body.type).toBe('DEBIT');
        const balanceResponse = await (0, supertest_1.default)(app)
            .get('/balance')
            .set('Authorization', `Bearer ${validToken}`);
        expect(balanceResponse.status).toBe(200);
        expect(balanceResponse.body.amount).toBe(1500);
    });
});
//# sourceMappingURL=integration.test.js.map