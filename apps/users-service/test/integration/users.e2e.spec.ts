import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('Users API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.DB_TYPE = 'sqlite';

    const { AppModule } = await import('../../src/app.module');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/POST /users', () => {
    return request(app.getHttpServer())
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

  it('/GET /users', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/GET /users/:id', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/users')
      .send({
        first_name: 'João',
        last_name: 'Souza',
        email: 'joao@email.com',
        password: 'secret123',
      })
      .expect(201);

    return request(app.getHttpServer())
      .get(`/users/${createRes.body.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(createRes.body.id);
        expect(res.body.first_name).toBe('João');
      });
  });

  it('/PATCH /users/:id', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/users')
      .send({
        first_name: 'Ana',
        last_name: 'Costa',
        email: 'ana@email.com',
        password: 'secret123',
      })
      .expect(201);

    return request(app.getHttpServer())
      .patch(`/users/${createRes.body.id}`)
      .send({ first_name: 'Ana Maria' })
      .expect(200)
      .expect((res) => {
        expect(res.body.first_name).toBe('Ana Maria');
      });
  });

  it('/DELETE /users/:id', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/users')
      .send({
        first_name: 'Carlos',
        last_name: 'Silva',
        email: 'carlos@email.com',
        password: 'secret123',
      })
      .expect(201);

    return request(app.getHttpServer())
      .delete(`/users/${createRes.body.id}`)
      .expect(200);
  });
});
