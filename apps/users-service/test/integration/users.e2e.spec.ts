import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('Users API (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;

  beforeAll(async () => {
    process.env.DB_TYPE = 'sqlite';
    process.env.JWT_PRIVATE_KEY = 'test-jwt-secret';

    const { AppModule } = await import('../../src/app.module');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/POST /users', () => {
    return request(httpServer)
      .post('/users')
      .send({
        first_name: 'Maria',
        last_name: 'Silva',
        email: 'maria@email.com',
        password: 'secret123',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.first_name).toBe('Maria');
        expect(res.body.email).toBe('maria@email.com');
      });
  });

  it('/POST /auth/login - returns token for valid credentials', async () => {
    await request(httpServer)
      .post('/users')
      .send({
        first_name: 'Login',
        last_name: 'User',
        email: 'login@email.com',
        password: 'secret123',
      })
      .expect(201);

    return request(httpServer)
      .post('/auth/login')
      .send({ email: 'login@email.com', password: 'secret123' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('token');
        expect(typeof res.body.token).toBe('string');
      });
  });

  it('/POST /auth/login - 401 for invalid password', async () => {
    return request(httpServer)
      .post('/auth/login')
      .send({ email: 'maria@email.com', password: 'wrongpassword' })
      .expect(401);
  });

  it('/GET /users - 401 without token', () => {
    return request(httpServer).get('/users').expect(401);
  });

  it('/GET /users - 200 with token', async () => {
    const loginRes = await request(httpServer)
      .post('/auth/login')
      .send({ email: 'maria@email.com', password: 'secret123' })
      .expect(201);

    const token = loginRes.body.token;

    return request(httpServer)
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/GET /users/:id - 200 with token', async () => {
    const createRes = await request(httpServer)
      .post('/users')
      .send({
        first_name: 'João',
        last_name: 'Souza',
        email: 'joao@email.com',
        password: 'secret123',
      })
      .expect(201);

    const loginRes = await request(httpServer)
      .post('/auth/login')
      .send({ email: 'joao@email.com', password: 'secret123' })
      .expect(201);

    return request(httpServer)
      .get(`/users/${createRes.body.id}`)
      .set('Authorization', `Bearer ${loginRes.body.token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(createRes.body.id);
        expect(res.body.first_name).toBe('João');
      });
  });

  it('/GET /users/:id - 401 without token', async () => {
    const createRes = await request(httpServer)
      .post('/users')
      .send({
        first_name: 'NoAuth',
        last_name: 'User',
        email: 'noauth@email.com',
        password: 'secret123',
      })
      .expect(201);

    return request(httpServer).get(`/users/${createRes.body.id}`).expect(401);
  });

  it('/PATCH /users/:id - 200 with token', async () => {
    const createRes = await request(httpServer)
      .post('/users')
      .send({
        first_name: 'Ana',
        last_name: 'Costa',
        email: 'ana@email.com',
        password: 'secret123',
      })
      .expect(201);

    const loginRes = await request(httpServer)
      .post('/auth/login')
      .send({ email: 'ana@email.com', password: 'secret123' })
      .expect(201);

    return request(httpServer)
      .patch(`/users/${createRes.body.id}`)
      .set('Authorization', `Bearer ${loginRes.body.token}`)
      .send({ first_name: 'Ana Maria' })
      .expect(200)
      .expect((res) => {
        expect(res.body.first_name).toBe('Ana Maria');
      });
  });

  it('/DELETE /users/:id - 200 with token', async () => {
    const createRes = await request(httpServer)
      .post('/users')
      .send({
        first_name: 'Carlos',
        last_name: 'Silva',
        email: 'carlos@email.com',
        password: 'secret123',
      })
      .expect(201);

    const loginRes = await request(httpServer)
      .post('/auth/login')
      .send({ email: 'carlos@email.com', password: 'secret123' })
      .expect(201);

    return request(httpServer)
      .delete(`/users/${createRes.body.id}`)
      .set('Authorization', `Bearer ${loginRes.body.token}`)
      .expect(200);
  });
});
