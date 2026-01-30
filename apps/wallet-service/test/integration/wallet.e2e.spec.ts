import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';

const originalConsole = { ...console };
const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

describe('Wallet API (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;

  beforeAll(async () => {
    Object.assign(console, mockConsole);

    process.env.NODE_ENV = 'test';
    process.env.JWT_PRIVATE_KEY = 'test-jwt-secret-key';
    process.env.PORT = '3001';
    process.env.GRPC_URL = '0.0.0.0:50053';

    const { TestAppModule } = await import('../../src/app.module.test');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useLogger(false);

    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();

    authToken = jwtService.sign({ username: 'admin', sub: 1 });
  }, 10000);

  afterAll(async () => {
    Object.assign(console, originalConsole);

    if (app) {
      await app.close();
    }
  });

  it('/POST /wallets', () => {
    return request(app.getHttpServer())
      .post('/wallets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        user_id: 'user-1',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('user_id', 'user-1');
        expect(res.body).toHaveProperty('balance', 0);
      });
  });

  it('/GET /wallets/user/:user_id', () => {
    return request(app.getHttpServer())
      .get('/wallets/user/user-1')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('user_id', 'user-1');
        expect(res.body).toHaveProperty('balance');
      });
  });

  it('/POST /wallets/:wallet_id/transactions (deposit)', async () => {
    const walletRes = await request(app.getHttpServer())
      .post('/wallets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        user_id: 'user-2',
      })
      .expect(201);

    return request(app.getHttpServer())
      .post(`/wallets/${walletRes.body.id}/transactions`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 50,
        type: 'DEPOSIT',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('amount', 50);
        expect(res.body).toHaveProperty('type', 'DEPOSIT');
      });
  });

  it('/POST /wallets/:wallet_id/transactions (withdraw)', async () => {
    const walletRes = await request(app.getHttpServer())
      .post('/wallets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        user_id: 'user-3',
      })
      .expect(201);

    return request(app.getHttpServer())
      .post(`/wallets/${walletRes.body.id}/transactions`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 30,
        type: 'WITHDRAW',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('amount', 30);
        expect(res.body).toHaveProperty('type', 'WITHDRAW');
      });
  });

  it('/GET /wallets/:wallet_id/transactions', async () => {
    const walletRes = await request(app.getHttpServer())
      .post('/wallets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        user_id: 'user-5',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/wallets/${walletRes.body.id}/transactions`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 30,
        type: 'deposit',
      })
      .expect(201);

    return request(app.getHttpServer())
      .get(`/wallets/${walletRes.body.id}/transactions`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
        expect(res.body[0].amount).toBe(30);
      });
  });

  it('/GET /wallets/:wallet_id/balance', async () => {
    const walletRes = await request(app.getHttpServer())
      .post('/wallets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        user_id: 'user-6',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/wallets/${walletRes.body.id}/transactions`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 75,
        type: 'deposit',
      })
      .expect(201);

    return request(app.getHttpServer())
      .get(`/wallets/${walletRes.body.id}/balance`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.balance).toBe(75);
      });
  });

  it('/POST /wallets/:wallet_id/transactions (insufficient balance)', async () => {
    const walletRes = await request(app.getHttpServer())
      .post('/wallets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        user_id: 'user-7',
      })
      .expect(201);

    return request(app.getHttpServer())
      .post(`/wallets/${walletRes.body.id}/transactions`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 100,
        type: 'withdraw',
      })
      .expect(500);
  });
});
