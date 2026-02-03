"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validate_1 = require("../src/middleware/validate");
const transaction_schema_1 = require("../src/schemas/transaction.schema");
const JWT_SECRET = 'ILIACHALLENGE';
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
    app.post('/transactions', authenticate, (0, validate_1.validate)(transaction_schema_1.createTransactionSchema), async (req, res) => {
        res.status(201).json({ success: true, data: req.body });
    });
    return app;
};
describe('Zod Validation Middleware', () => {
    let app;
    let validToken;
    beforeAll(() => {
        app = createTestApp();
        validToken = jsonwebtoken_1.default.sign({ id: '550e8400-e29b-41d4-a716-446655440000' }, JWT_SECRET);
    });
    describe('POST /transactions - Validation', () => {
        it('should accept valid transaction data', async () => {
            const validData = {
                amount: 100,
                type: 'CREDIT',
            };
            const response = await (0, supertest_1.default)(app)
                .post('/transactions')
                .set('Authorization', `Bearer ${validToken}`)
                .send(validData);
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('amount', 100);
            expect(response.body.data).toHaveProperty('type', 'CREDIT');
        });
        it('should reject missing amount', async () => {
            const invalidData = {
                type: 'CREDIT',
            };
            const response = await (0, supertest_1.default)(app)
                .post('/transactions')
                .set('Authorization', `Bearer ${validToken}`)
                .send(invalidData);
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Validation failed');
        });
        it('should reject invalid amount (negative)', async () => {
            const invalidData = {
                amount: -50,
                type: 'CREDIT',
            };
            const response = await (0, supertest_1.default)(app)
                .post('/transactions')
                .set('Authorization', `Bearer ${validToken}`)
                .send(invalidData);
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Validation failed');
        });
        it('should reject invalid type', async () => {
            const invalidData = {
                amount: 100,
                type: 'INVALID',
            };
            const response = await (0, supertest_1.default)(app)
                .post('/transactions')
                .set('Authorization', `Bearer ${validToken}`)
                .send(invalidData);
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Validation failed');
        });
        it('should reject non-integer amount', async () => {
            const invalidData = {
                amount: 100.5,
                type: 'DEBIT',
            };
            const response = await (0, supertest_1.default)(app)
                .post('/transactions')
                .set('Authorization', `Bearer ${validToken}`)
                .send(invalidData);
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Validation failed');
        });
        it('should reject amount of zero', async () => {
            const invalidData = {
                amount: 0,
                type: 'CREDIT',
            };
            const response = await (0, supertest_1.default)(app)
                .post('/transactions')
                .set('Authorization', `Bearer ${validToken}`)
                .send(invalidData);
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Validation failed');
        });
        it('should reject extra fields in body', async () => {
            const invalidData = {
                amount: 100,
                type: 'CREDIT',
                user_id: '550e8400-e29b-41d4-a716-446655440000',
            };
            const response = await (0, supertest_1.default)(app)
                .post('/transactions')
                .set('Authorization', `Bearer ${validToken}`)
                .send(invalidData);
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Validation failed');
        });
    });
});
//# sourceMappingURL=validation.test.js.map