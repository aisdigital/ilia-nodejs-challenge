"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = 'ILIACHALLENGE';
const createTestApp = () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.get('/health', async (_req, res) => {
        res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
    });
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
    app.get('/transactions', authenticate, async (_req, res) => {
        res.status(200).json({ message: 'Get transactions', user: _req.user });
    });
    app.post('/transactions', authenticate, async (_req, res) => {
        res.status(201).json({ message: 'Create transaction', data: _req.body });
    });
    app.use((_req, res) => {
        res.status(404).json({ error: 'Route not found' });
    });
    app.use((err, _req, res, _next) => {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    });
    return app;
};
describe('Health Endpoint', () => {
    let app;
    beforeAll(() => {
        app = createTestApp();
    });
    test('GET /health should return 200 with OK status', async () => {
        const response = await (0, supertest_1.default)(app)
            .get('/health')
            .expect(200);
        expect(response.body).toHaveProperty('status', 'OK');
        expect(response.body).toHaveProperty('timestamp');
    });
    test('GET /health should return proper JSON format', async () => {
        const response = await (0, supertest_1.default)(app)
            .get('/health')
            .expect('Content-Type', /json/);
        expect(response.status).toBe(200);
        expect(typeof response.body.timestamp).toBe('string');
    });
});
//# sourceMappingURL=health.test.js.map