import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/utils/prisma/prisma.service';
import { JwtAuthGuard } from '../src/domains/auth/jwt.guard';
import { JwtAuthGuardMock } from './utils/stubs/authentication.guard.stub';

describe('Wallet E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const USER_ID = 1;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(JwtAuthGuardMock)
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);

    await app.init();
  });

  afterEach(async () => {
    await prisma.transaction.deleteMany();
    await prisma.wallet.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /transactions', () => {
    it('should credit wallet', async () => {
      await prisma.wallet.create({
        data: { user_id: USER_ID, balance: 0 },
      });

      await request(app.getHttpServer())
        .post('/transactions')
        .send({
          user_id: USER_ID,
          amount: 100,
          type: 'CREDIT',
        })
        .expect(201);

      const wallet = await prisma.wallet.findUnique({
        where: { user_id: USER_ID },
      });

      expect(wallet?.balance).toBe(100);
    });

    it('should fail debit with insufficient balance', async () => {
      await prisma.wallet.create({
        data: { user_id: USER_ID, balance: 50 },
      });

      await request(app.getHttpServer())
        .post('/transactions')
        .send({
          user_id: USER_ID,
          amount: 100,
          type: 'DEBIT',
        })
        .expect(400);
    });

    it('should return 404 if wallet does not exist', async () => {
      await request(app.getHttpServer())
        .post('/transactions')
        .send({
          user_id: USER_ID,
          amount: 100,
          type: 'CREDIT',
        })
        .expect(404);
    });
  });

  describe('GET /transactions', () => {
    beforeEach(async () => {
      await prisma.wallet.create({
        data: { user_id: USER_ID, balance: 0 },
      });

      await prisma.transaction.createMany({
        data: [
          { user_id: USER_ID, amount: 100, type: 'CREDIT' },
          { user_id: USER_ID, amount: 50, type: 'DEBIT' },
        ],
      });
    });

    it('should list all transactions', async () => {
      const res = await request(app.getHttpServer())
        .get('/transactions')
        .expect(200);

      expect(res.body.length).toBe(2);
    });

    it('should filter transactions by type', async () => {
      const res = await request(app.getHttpServer())
        .get('/transactions?type=CREDIT')
        .expect(200);

      expect(res.body.length).toBe(1);
      expect(res.body[0].type).toBe('CREDIT');
    });
  });

  describe('GET /balance', () => {
    it('should return wallet balance', async () => {
      await prisma.wallet.create({
        data: { user_id: USER_ID, balance: 0 },
      });

      await prisma.transaction.createMany({
        data: [
          { user_id: USER_ID, amount: 200, type: 'CREDIT' },
          { user_id: USER_ID, amount: 50, type: 'DEBIT' },
        ],
      });

      const res = await request(app.getHttpServer())
        .get('/balance')
        .expect(200);

      expect(res.body.amount).toBe(150);
    });
  });
});
