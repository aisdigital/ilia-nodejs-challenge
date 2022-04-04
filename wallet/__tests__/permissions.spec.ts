
/* eslint-disable @typescript-eslint/no-unused-vars */
import supertest from 'supertest';
import app from '../src/server';
import mongoose from 'mongoose';
import assert from 'assert';
import {
  mongoServerInit,
  accessToken,
  createFakeAccount,
  createFakeProfile,
  createFakePermission,
  checkErrorSchema,
} from './utils';

describe('POST /permission/profile/', () => {
  mongoServerInit();
  let account;
  beforeEach(async () => {
    mongoose.connection.dropDatabase();
    account = await createFakeAccount();
  });

  it('Should create a profile', async (done) => {
    const localPermission = await createFakePermission('deative_workspace');
    return supertest(app)
      .post('/permission/profile/')
      .set('Authorization', accessToken(account.user_id))
      .send({
        name: 'profile',
        permissions_id: [`${localPermission._id}`],
      })
      .expect(201)
      .then(async (response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            name: expect.any(String),
            permissions_id: [expect.any(String)],
          }),
        );
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not create a profile without required params', (done) => {
    return supertest(app)
      .post('/permission/profile/')
      .set('Authorization', accessToken(account.user_id))
      .send({})
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['name', 'permissions_id']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not create a profile without JWT', async (done) => {
    const localPermission = await createFakePermission('deative_workspace');
    return supertest(app)
      .post('/permission/profile/')
      .send({
        name: 'profile',
        permissions_id: [`${localPermission._id}`],
      })
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not create a wrong profile ', (done) => {
    return supertest(app)
      .post('/permission/profile/')
      .set('Authorization', accessToken(account.user_id))
      .send({
        name: true,
        permissions_id: null,
      })
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['name', 'permissions_id']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('GET /permission/profile/', () => {
  mongoServerInit();
  let account;
  beforeEach(async () => {
    mongoose.connection.dropDatabase();
    account = await createFakeAccount();
  });

  it('Should list profiles', (done) => {
    return supertest(app)
      .get('/permission/profile/')
      .set('Authorization', accessToken(account.user_id))
      .expect(200)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        expect(response.body).toEqual(expect.not.arrayContaining(['']));
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not list profiles without JWT', (done) => {
    return supertest(app)
      .get('/permission/profile/')
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not list profile if params query is wrong', (done) => {
    return supertest(app)
      .get('/permission/profile/')
      .set('Authorization', accessToken(account.user_id))
      .query({ page: 'malware' })
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['page']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});
describe('GET /permission/profile/:profile_id/', () => {
  mongoServerInit();
  let account;
  beforeEach(async () => {
    mongoose.connection.dropDatabase();
    account = await createFakeAccount();
  });

  it('Should detail a profile', async (done) => {
    const localPermission = await createFakePermission('detail_workspace');
    const localProfile = await createFakeProfile(localPermission._id);

    return supertest(app)
      .get(`/permission/profile/${localProfile._id}`)
      .set('Authorization', accessToken(account.user_id))
      .expect(200)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not detail a guest profile', async (done) => {
    return supertest(app)
      .get(`/permission/profile/${mongoose.Types.ObjectId()}`)
      .set('Authorization', accessToken(account.user_id))
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['profile_id']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not detail a profile without JWT', async (done) => {
    const localPermission = await createFakePermission('detail_workspace');
    const localProfile = await createFakeProfile(localPermission._id);

    return supertest(app)
      .get(`/permission/profile/${localProfile._id}`)
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});
describe('PATCH /permission/profile/:profile_id/', () => {
  mongoServerInit();
  let account;
  beforeEach(async () => {
    mongoose.connection.dropDatabase();
    account = await createFakeAccount();
  });

  it('Should update a profile', async (done) => {
    const localPermission = await createFakePermission('deative_workspace');
    const localProfile = await createFakeProfile(localPermission._id);
    const data = {
      name: 'this is a test',
    };
    return supertest(app)
      .patch(`/permission/profile/${localProfile._id}`)
      .set('Authorization', accessToken(account.user_id))
      .send(data)
      .expect(200)
      .then(async (response) => {
        assert(response.body.name, data.name);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not update a ghost profile', async (done) => {
    const fakeProfile = 'malware';
    return supertest(app)
      .patch(`/permission/profile/${fakeProfile}`)
      .set('Authorization', accessToken(account.user_id))
      .send({
        name: 'this is a test',
      })
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['profile_id']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not update a profile with wrong params', async (done) => {
    const localPermission = await createFakePermission('deative_workspace');
    const localProfile = await createFakeProfile(localPermission._id);

    return supertest(app)
      .patch(`/permission/profile/${localProfile._id}`)
      .set('Authorization', accessToken(account.user_id))
      .send({
        name: null,
      })
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['name']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not update a profile without JWT', async (done) => {
    const localPermission = await createFakePermission('deative_workspace');
    const localProfile = await createFakeProfile(localPermission._id);
    return supertest(app)
      .patch(`/permission/profile/${localProfile._id}`)
      .send({
        name: 'this is a test',
      })
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});
describe('DELETE /permission/profile/:profile_id/', () => {
  mongoServerInit();
  let account;
  beforeEach(async () => {
    mongoose.connection.dropDatabase();
    account = await createFakeAccount();
  });
  it('Should delete a profile', async (done) => {
    const localPermission = await createFakePermission('deative_workspace');
    const localProfile = await createFakeProfile(localPermission._id);
    return supertest(app)
      .delete(`/permission/profile/${localProfile._id}`)
      .set('Authorization', accessToken(account.user_id))
      .expect(204)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not delete a profile without JWT', async (done) => {
    const localPermission = await createFakePermission('deative_workspace');
    const localProfile = await createFakeProfile(localPermission._id);
    return supertest(app)
      .delete(`/permission/profile/${localProfile._id}`)
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not delete a guest profile', async (done) => {
    const fakeProfile = 'malware';
    return supertest(app)
      .delete(`/permission/profile/${fakeProfile}`)
      .set('Authorization', accessToken(account.user_id))
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['profile_id']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});
