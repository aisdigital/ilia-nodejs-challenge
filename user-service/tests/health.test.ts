import request from 'supertest';
import express from 'express';
import { Express, Request, Response } from 'express';

const createApp = (): Express => {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  return app;
};

describe('User Service - Health Endpoint', () => {
  let app: Express;

  beforeAll(() => {
    app = createApp();
  });

  it('should return 200 with OK status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should return proper JSON format', async () => {
    const response = await request(app)
      .get('/health')
      .expect('Content-Type', /json/);

    expect(response.status).toBe(200);
    expect(typeof response.body.timestamp).toBe('string');
  });
});
