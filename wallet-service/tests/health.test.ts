import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'ILIACHALLENGE';

// Create a minimal Express app for testing
const createTestApp = (): Express => {
  const app = express();

  app.use(express.json());

  // Health endpoint
  app.get('/health', async (_req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // JWT Authentication Middleware
  const authenticate = (req: Request, res: Response, next: NextFunction): void => {
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
      const decoded = jwt.verify(token, JWT_SECRET);
      (req as any).user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  };

  // Protected Routes
  app.get('/transactions', authenticate, async (_req: Request, res: Response) => {
    res.status(200).json({ message: 'Get transactions', user: (_req as any).user });
  });

  app.post('/transactions', authenticate, async (_req: Request, res: Response) => {
    res.status(201).json({ message: 'Create transaction', data: (_req as any).body });
  });

  // 404 Handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Error Handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  return app;
};

describe('Health Endpoint', () => {
  let app: Express;

  beforeAll(() => {
    app = createTestApp();
  });

  test('GET /health should return 200 with OK status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('GET /health should return proper JSON format', async () => {
    const response = await request(app)
      .get('/health')
      .expect('Content-Type', /json/);

    expect(response.status).toBe(200);
    expect(typeof response.body.timestamp).toBe('string');
  });
});
