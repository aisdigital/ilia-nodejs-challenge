/* eslint-disable @typescript-eslint/no-unused-vars */
import supertest from 'supertest';
import app from '../src/server';
import mongoose from 'mongoose';
import assert from 'assert';

//TODO teste com diferentes tipos de imagens

import {
  mongoServerInit,
  accessToken,
  createFakeUser,
  checkErrorSchema,
  checkErrorIdSchema,
  getRandomEmail,
} from './utils';

describe('POST /', () => {
  mongoServerInit();
  let user;
  beforeEach(async () => {
    user = await createFakeUser();
  });

  it('Should not create a user without required parameters', (done) => {
    return supertest(app)
      .post('/users')
      .set('Accept', 'application/json')
      .send({})
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['first_name', 'last_name', 'email', 'password']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });

  it('Should not create a user with a wrong parameters', (done) => {
    return supertest(app)
      .post('/users')
      .set('Accept', 'application/json')
      .send({
        first_name: '',
        last_name: '',
        email: 0,
        password: '',
      })
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['first_name', 'last_name', 'email', 'password']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not create a new user if already have one', async (done) => {
    const email = await getRandomEmail();
    await mongoose.model('User').create({
      first_name: 'First',
      last_name: 'Last',
      email: email,
      password: 'Ab@12312',
    });

    return supertest(app)
      .post('/users')
      .set('Accept', 'application/json')
      .send({
        first_name: 'First',
        last_name: 'Last',
        email: email,
        password: 'Ab@12312',
      })
      .expect(422)
      .then((response) => {
        checkErrorIdSchema(response.text, 'email', 'duplicated-email');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });

  it('Should create a new user', async (done) => {
    const email = await getRandomEmail();
    const data = {
      first_name: 'First',
      last_name: 'Last',
      email: email,
      password: 'Ab@12312',
    };
    return supertest(app)
      .post('/users')
      .set('Accept', 'application/json')
      .send(data)
      .expect(201)
      .then(async (response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            _id: expect.any(String),
            email: expect.any(String),
            first_name: expect.any(String),
            last_name: expect.any(String),
            access_token: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        );
        done();
      })
      .catch((err) => done(err));
  });
});

describe('GET /', () => {
  mongoServerInit();
  let user;
  beforeEach(async () => {
    user = await createFakeUser();
  });
  it('Should list users', async (done) => {
    await createFakeUser();
    return supertest(app)
      .get('/users')
      .set('Authorization', accessToken(user._id))
      .expect(200)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        expect(response.body).toEqual(expect.not.arrayContaining(['']));
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not list combo without JWT', (done) => {
    return supertest(app)
      .get('/users')
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('PATCH /users/:user_id', () => {
  mongoServerInit();
  let user;
  beforeEach(async () => {
    user = await createFakeUser();
  });
  it('Should update user', async (done) => {
    const data = {
      first_name: 'FirstUpdate',
    };
    const user = await createFakeUser();
    return supertest(app)
      .patch(`/users/${user._id}`)
      .set('Authorization', accessToken(user._id as string))
      .set('Accept', 'application/json')
      .send(data)
      .expect(200)
      .then(async (response) => {
        assert(response.body.first_name, data.first_name);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });

  it('Should not update user if pass wrong id', async (done) => {
    const data = {
      first_name: 'FirstUpdate',
    };
    const user = await createFakeUser();
    return supertest(app)
      .patch(`/users/wrongid`)
      .set('Authorization', accessToken(user._id as string))
      .set('Accept', 'application/json')
      .send(data)
      .expect(422)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not update user without JWT', async (done) => {
    const user = await createFakeUser();

    return supertest(app)
      .patch(`/users/${user._id}`)
      .set('Accept', 'application/json')
      .send({
        first_name: 'teste',
      })
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not update user with wrong parameters', async (done) => {
    const user = await createFakeUser();

    return supertest(app)
      .patch(`/users/${user._id}`)

      .set('Authorization', accessToken(user._id as string))
      .set('Accept', 'application/json')
      .send({
        first_name: '',
        last_name: '',
        email: 0,
        password: '',
      })
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['first_name', 'last_name', 'email', 'password']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('DELETE /users/:user_id', () => {
  mongoServerInit();
  let user;
  beforeEach(async () => {
    user = await createFakeUser();
  });

  it('Should delete a user', async (done) => {
    const user = await createFakeUser();
    return supertest(app)
      .delete(`/users/${user._id}`)
      .set('Authorization', accessToken(user._id as string))
      .set('Accept', 'application/json')
      .expect(204)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });

  it('Should not delete a user without JWT', async (done) => {
    const user = await createFakeUser();

    return supertest(app)
      .delete(`/users/${user._id}`)
      .set('Accept', 'application/json')
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not delete user if pass wrong id', async (done) => {
    const user = await createFakeUser();
    return supertest(app)
      .patch(`/users/wrongid`)
      .set('Authorization', accessToken(user._id as string))
      .set('Accept', 'application/json')
      .expect(422)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});
