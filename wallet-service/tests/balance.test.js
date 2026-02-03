"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = 'ILIACHALLENGE';
const USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const createTestApp = () => {
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
    app.get('/balance', authenticate, async (req, res) => {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const mockTransactions = [
            { type: 'CREDIT', amount: 1000 },
            { type: 'CREDIT', amount: 500 },
            { type: 'DEBIT', amount: 200 },
        ];
        const groupedTransactions = mockTransactions.reduce((acc, tx) => {
            const existing = acc.find((g) => g.type === tx.type);
            if (existing) {
                existing._sum = { ...existing._sum, amount: (existing._sum.amount || 0) + tx.amount };
            }
            else {
                acc.push({ type: tx.type, _sum: { amount: tx.amount } });
            }
            return acc;
        }, []);
        const creditSum = groupedTransactions.find((g) => g.type === 'CREDIT')?._sum.amount || 0;
        const debitSum = groupedTransactions.find((g) => g.type === 'DEBIT')?._sum.amount || 0;
        const balance = creditSum - debitSum;
        res.status(200).json({ amount: balance });
    });
    return app;
};
describe('GET /balance', () => {
    let app;
    let validToken;
    beforeAll(() => {
        app = createTestApp();
        validToken = jsonwebtoken_1.default.sign({ id: USER_ID }, JWT_SECRET);
    });
    it('should calculate balance correctly with groupBy logic', async () => {
        const response = await (0, supertest_1.default)(app)
            .get('/balance')
            .set('Authorization', `Bearer ${validToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('amount');
        expect(response.body.amount).toBe(1300);
    });
    it('should return 401 without authentication', async () => {
        const response = await (0, supertest_1.default)(app).get('/balance');
        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Missing authorization header');
    });
    it('should return 401 with invalid token', async () => {
        const response = await (0, supertest_1.default)(app)
            .get('/balance')
            .set('Authorization', 'Bearer invalid-token');
        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Invalid or expired token');
    });
});
//# sourceMappingURL=balance.test.js.map