/* eslint-disable @typescript-eslint/no-unused-vars */
import supertest from 'supertest';
import app from '../src/server';
import { AccountModel, UserModel, IUser } from '../src/database/mongoose';
import mongoose from 'mongoose';
import assert from 'assert';
import {
  mongoServerInit,
  accessToken,
  createFakeAccount,
  createFakeWorkspace,
  createFakeInitiative,
  checkErrorSchema,
  createFakeSubscriptions,
} from './utils';
import { svgBase64Image } from './utils/imageBase64';
import InitiativesUser from '../src/modules/Initiatives/models/InitiativesUser';

describe('POST /', () => {
  mongoServerInit();
  let account;
  let workspace;

  beforeEach(async () => {
    account = await createFakeAccount();
    workspace = await createFakeWorkspace(account.user_id);
  });

  it('Should create an initiative', (done) => {
    return supertest(app)
      .post(`/initiative/`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .send({
        name: 'admin',
        workspaces: [workspace._id],
        description: 'admin teste',
        duration_start: Date.now,
        duration_end: Date.now,
        copyright: false,
        highlight: false,
      })
      .expect(201)
      .then(async (response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            _id: expect.any(String),
            workspaces: expect.anything(),
            account_id: expect.any(String),
            name: expect.any(String),
            description: expect.any(String),
            duration_start: expect.any(String),
            immediate_publication: false,
            template: expect.any(String),
            keywords: expect.anything(),
            copyright: false,
            highlight: false,
            cover_img_url: null,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        );
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not create an initiative with wrong image', (done) => {
    return supertest(app)
      .post(`/initiative/`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .send({
        name: 'admin',
        workspaces: [workspace._id],
        description: 'admin teste',
        duration_start: Date.now,
        duration_end: Date.now,
        copyright: false,
        highlight: false,
        banner_img_url: svgBase64Image,
        cover_img_url: svgBase64Image,
      })
      .expect(422)
      .then(async (response) => {
        checkErrorSchema(response.text, ['banner_img_url', 'cover_img_url']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not create an initiative if duration_end is bigger then duration_start ', (done) => {
    return supertest(app)
      .post(`/initiative/`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .send({
        name: 'admin',
        description: 'admin teste',
        workspaces: [workspace._id],
        duration_start: Date.now,
        duration_end: new Date(1997, 5, 13),
        copyright: false,
        highlight: false,
      })
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['duration_end']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not create an initiative with duration_start if immediate_publication exist', (done) => {
    return supertest(app)
      .post(`/initiative/`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .send({
        name: 'admin',
        description: 'admin teste',
        workspaces: [workspace._id],
        immediate_publication: true,
        duration_start: new Date(2023, 5, 13),
        copyright: false,
        highlight: false,
      })
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['immediate_publication', 'duration_start']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should create an initiative with invite', async (done) => {
    await createFakeSubscriptions(account._id);
    const user = await UserModel.create({
      name: 'invite',
      email: 'invite@mobix.com',
    });
    await AccountModel.create({ user_id: user._id });
    return supertest(app)
      .post(`/initiative/`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .send({
        name: 'admin',
        description: 'admin teste',
        workspaces: [workspace._id],
        duration_start: Date.now,
        duration_end: Date.now,
        copyright: false,
        highlight: false,
        invites: ['invite@mobix.com'],
      })
      .expect(201)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not create an initiative without JWT', (done) => {
    return supertest(app)
      .post(`/initiative/`)
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not create an initiative with wrong params', (done) => {
    return supertest(app)
      .post(`/initiative/`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .send({
        name: '',
        description: null,
        workspaces: null,
        duration_start: 'malware',
        duration_end: 'malware',
        copyright: '',
        highlight: '',
      })
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, [
          'name',
          'description',
          'workspaces',
          'duration_start',
          'duration_end',
          'copyright',
          'highlight',
        ]);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('GET /:workspace_id/initiatives', () => {
  mongoServerInit();
  let account;
  let workspace;

  beforeEach(async () => {
    account = await createFakeAccount();
    workspace = await createFakeWorkspace(account.user_id);
    await createFakeInitiative(account._id, workspace._id);
  });
  it('Should list initiatives workspace', async (done) => {
    return supertest(app)
      .get(`/initiative/`)
      .set('Authorization', accessToken(account.user_id))
      .query({ workspaces: `${workspace._id}` })
      .expect(200)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        expect(response.body).toEqual(expect.not.arrayContaining(['']));
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not list initiatives workspace without JWT', (done) => {
    return supertest(app)
      .get(`/initiative/`)
      .query({ workspaces: workspace._id })
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not list initiatives if workspace not exists ', (done) => {
    return supertest(app)
      .get(`/initiative/`)
      .set('Authorization', accessToken(account.user_id))
      .query({ workspace_id: 'malware' })
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['workspace_id']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('PATCH /initiatives/:initiatives_id/', () => {
  mongoServerInit();
  let account;
  let workspace;
  let initiative;

  beforeEach(async () => {
    account = await createFakeAccount();
    workspace = await createFakeWorkspace(account.user_id);
    initiative = await createFakeInitiative(account._id, workspace._id);
  });

  it('Should update an initiative', async (done) => {
    const data = {
      name: 'test',
    };
    return supertest(app)
      .patch(`/initiative/${initiative._id}`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .send(data)
      .expect(200)
      .then(async (response) => {
        assert(response.body.name, data.name);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not update an initiative with wrong image', async (done) => {
    const data = {
      banner_img_url: svgBase64Image,
      cover_img_url: svgBase64Image,
    };
    return supertest(app)
      .patch(`/initiative/${initiative._id}`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .send(data)
      .expect(422)
      .then(async (response) => {
        checkErrorSchema(response.text, ['banner_img_url', 'cover_img_url']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });

  it('Should not update an initiative without JWT', (done) => {
    return supertest(app)
      .patch(`/initiative/${initiative._id}`)
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not update an initiative with wrong params', (done) => {
    return supertest(app)
      .patch(`/initiative/${initiative._id}`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
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
  it('Should not update initiative if initiative not exist', (done) => {
    const fake = 'apsdasdas';
    return supertest(app)
      .patch(`/initiative/${fake}`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .send({
        name: 'test',
      })
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['initiative_id']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('POST /:initiative_id/active', () => {
  mongoServerInit();
  let account;
  let workspace;
  let initiative;

  beforeEach(async () => {
    account = await createFakeAccount();
    workspace = await createFakeWorkspace(account.user_id);
    initiative = await createFakeInitiative(account._id, workspace._id);
  });

  it('Should active an initiative', (done) => {
    return supertest(app)
      .post(`/initiative/${initiative._id}/active`)
      .set('Authorization', accessToken(account.user_id))
      .expect(204)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not active an initiative without JWT', (done) => {
    return supertest(app)
      .post(`/initiative/${initiative._id}/active`)
      .expect(401)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not active an nonexistence initiative', (done) => {
    return supertest(app)
      .post(`/initiative/${mongoose.Types.ObjectId()}/active`)
      .set('Authorization', accessToken(account.user_id))
      .expect(422)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});
describe('POST /:initiative_id/deactive', () => {
  mongoServerInit();
  let account;
  let workspace;
  let initiative;

  beforeEach(async () => {
    account = await createFakeAccount();
    workspace = await createFakeWorkspace(account.user_id);
    initiative = await createFakeInitiative(account._id, workspace._id);
  });

  it('Should deactive an initiative', (done) => {
    return supertest(app)
      .post(`/initiative/${initiative._id}/deactive`)
      .set('Authorization', accessToken(account.user_id))
      .expect(204)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not deactive an initiative without JWT', (done) => {
    return supertest(app)
      .post(`/initiative/${initiative._id}/deactive`)
      .expect(401)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not deactive an nonexistence initiative', (done) => {
    return supertest(app)
      .post(`/initiative/${mongoose.Types.ObjectId()}/deactive`)
      .set('Authorization', accessToken(account.user_id))
      .expect(422)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});
describe('DELETE /:initiative_id/', () => {
  mongoServerInit();
  let account;
  let workspace;
  let initiative;

  beforeEach(async () => {
    account = await createFakeAccount();
    workspace = await createFakeWorkspace(account.user_id);
    initiative = await createFakeInitiative(account._id, workspace._id);
  });

  it('Should delete an initiative', (done) => {
    return supertest(app)
      .delete(`/initiative/${initiative._id}`)
      .set('Authorization', accessToken(account.user_id))
      .expect(204)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not delete an initiative without JWT', (done) => {
    return supertest(app)
      .delete(`/initiative/${initiative._id}`)
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not delete if initiative not exist', (done) => {
    const fake = 'malware';
    return supertest(app)
      .delete(`/initiative/${fake}`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')

      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['initiative_id']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});
describe('POST /initiatives/:initiative_id/invites', () => {
  mongoServerInit();
  let account;
  let workspace;
  let initiative;

  beforeEach(async () => {
    account = await createFakeAccount();
    workspace = await createFakeWorkspace(account.user_id);
    initiative = await createFakeInitiative(account._id, workspace._id);
  });

  it('Should invite an initiative', async (done) => {
    await createFakeSubscriptions(account._id);
    const localAccount = await createFakeAccount();
    const localUser = await UserModel.findById(localAccount.user_id);
    return supertest(app)
      .post(`/initiative/${initiative._id}/invites/`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .send({
        invites: [localUser.email],
      })

      .expect(204)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });

  it('Should not invite an initiative without JWT', (done) => {
    return supertest(app)
      .post(`/initiative/${initiative._id}/invites`)
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not inivite an initiative without required param', (done) => {
    return supertest(app)
      .post(`/initiative/${initiative._id}/invites`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .send({})
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['invites']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not inivite an initiative with wrong param', (done) => {
    return supertest(app)
      .post(`/initiative/${initiative._id}/invites`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .send({
        invites: {
          email: 'malware',
        },
      })
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['invites', 'invites.email']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});
describe('GET /initiatives/:initiative_id/', () => {
  mongoServerInit();
  let account;
  let workspace;
  let initiative;

  beforeEach(async () => {
    account = await createFakeAccount();
    workspace = await createFakeWorkspace(account.user_id);
    initiative = await createFakeInitiative(account._id, workspace._id);
  });

  it('Should get an initiative by id', (done) => {
    return supertest(app)
      .get(`/initiative/${initiative._id}`)
      .set('Authorization', accessToken(account.user_id))
      .expect(200)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        expect(response.body).toEqual(expect.not.arrayContaining(['']));
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not get an initiative by id without JWT', (done) => {
    return supertest(app)
      .get(`/initiative/${initiative._id}`)
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});
describe('PATCH /:invite_id/invites/accept', () => {
  mongoServerInit();
  let account;
  let workspace;
  let initiative;

  beforeEach(async () => {
    account = await createFakeAccount();
    workspace = await createFakeWorkspace(account.user_id);
    initiative = await createFakeInitiative(account._id, workspace._id);
  });

  it('Should active invite initiative', async (done) => {
    const invite = await InitiativesUser.create({
      account_id: account._id,
      initiative_id: initiative._id,
      accepted: 'pending',
    });
    return supertest(app)
      .patch(`/initiative/${invite._id}/invites/accept`)
      .set('Authorization', accessToken(account.user_id))
      .expect(204)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not active invite initiative without JWT', async (done) => {
    const invite = await InitiativesUser.create({
      account_id: account._id,
      initiative_id: initiative._id,
      accepted: 'pending',
    });
    return supertest(app)
      .patch(`/initiative/${invite._id}/invites/accept`)
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not active invite initiative with initiative_id is invalid', (done) => {
    const joker = 'malware';
    return supertest(app)
      .patch(`/initiative/${joker}/invites/accept`)
      .set('Authorization', accessToken(account.user_id))
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['invite_id']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('GET /:initiative_id/invites/', () => {
  mongoServerInit();
  let account;
  let workspace;
  let initiative;

  beforeEach(async () => {
    account = await createFakeAccount();
    workspace = await createFakeWorkspace(account.user_id);
    initiative = await createFakeInitiative(account._id, workspace._id);
  });
  it('should list invites initiative', (done) => {
    return supertest(app)
      .get(`/initiative//${initiative._id}/invites/`)
      .set('Authorization', accessToken(account.user_id))
      .expect(200)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        expect(response.body).toEqual(expect.not.arrayContaining(['']));
        done();
      })
      .catch((err) => done(err));
  });
  it('should not list invites initiative with wrong query params', (done) => {
    return supertest(app)
      .get(`/initiative//${initiative._id}/invites/`)
      .set('Authorization', accessToken(account.user_id))
      .query({ limit: 'malware' })
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['limit']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('should not list guest invites initiative', (done) => {
    return supertest(app)
      .get(`/initiative/${mongoose.Types.ObjectId()}/invites/`)
      .set('Authorization', accessToken(account.user_id))
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['initiative_id']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('should  not list invites initiative without JWT', (done) => {
    return supertest(app)
      .get(`/initiative/${initiative._id}/invites/`)
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});
describe('PATCH /:initiative_id/invites/:account_id/reject', () => {
  mongoServerInit();
  let account;
  let workspace;
  let initiative;

  beforeEach(async () => {
    account = await createFakeAccount();
    workspace = await createFakeWorkspace(account.user_id);
    initiative = await createFakeInitiative(account._id, workspace._id);
  });

  it('Should reject invite initiative', async (done) => {
    const localAccount = await createFakeAccount();
    const invite = await InitiativesUser.create({
      account_id: localAccount._id,
      initiative_id: initiative._id,
      accepted: 'pending',
    });
    return supertest(app)
      .patch(`/initiative/${invite._id}/invites/${localAccount._id}/reject`)
      .set('Authorization', accessToken(account.user_id))
      .expect(204)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not reject invite initiative without JWT', async (done) => {
    const localAccount = await createFakeAccount();
    return supertest(app)
      .patch(`/initiative/${initiative._id}/invites/${localAccount._id}/reject`)
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not reject invite initiative with initiative_id is invalid', async (done) => {
    const localAccount = await createFakeAccount();
    const joker = 'malware';
    return supertest(app)
      .patch(`/initiative/${joker}/invites/${localAccount._id}/reject`)
      .set('Authorization', accessToken(account.user_id))
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['invite_id']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});
describe('GET /initiative/invites/me', () => {
  mongoServerInit();
  let account;
  beforeEach(async () => {
    account = await createFakeAccount();
  });
  it('Should list my initiatives invites', (done) => {
    return supertest(app)
      .get(`/initiative/initiative/invites/me`)
      .set('Authorization', accessToken(account.user_id))
      .expect(200)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not list my initiatives with wrong query params', (done) => {
    return supertest(app)
      .get(`/initiative/initiative/invites/me`)
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
  it('Should not list my initiatives invites without jwt', (done) => {
    return supertest(app)
      .get(`/initiative/initiative/invites/me`)
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});
describe('GET /initiative/invites/me/:initiative_id', () => {
  mongoServerInit();
  let account;
  let workspace;
  let initiative;

  beforeEach(async () => {
    account = await createFakeAccount();
    workspace = await createFakeWorkspace(account.user_id);
    initiative = await createFakeInitiative(account._id, workspace._id);
  });
  it('Should detail my initiatives invites', async (done) => {
    await InitiativesUser.create({
      account_id: account._id,
      initiative_id: initiative._id,
      accepted: 'active',
    });
    return supertest(app)
      .get(`/initiative/initiative/invites/me/${initiative._id}`)
      .set('Authorization', accessToken(account.user_id))
      .expect(200)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not detail my initiatives invites without jwt', (done) => {
    return supertest(app)
      .get(`/initiative/initiative/invites/me/${initiative._id}`)
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});
describe('POST /:initiative_id/follow', () => {
  mongoServerInit();
  let account;
  let secundaryAccount;
  let workspace;
  let initiative;

  beforeEach(async () => {
    account = await createFakeAccount();
    secundaryAccount = await createFakeAccount();
    workspace = await createFakeWorkspace(secundaryAccount._id, 'public');
    initiative = await createFakeInitiative(secundaryAccount._id, workspace._id);
  });
  it('Should follow an initiative', () => {
    return supertest(app)
      .post(`/initiative/${initiative._id}/follow/`)
      .set('Authorization', accessToken(account.user_id))
      .expect(204);
  });
  it('Should not follow an initiative without JWT', (done) => {
    return supertest(app)
      .post(`/initiative/${initiative._id}/follow/`)
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not follow an initiative if id is wrong', () => {
    const joker = 'malware';
    return supertest(app)
      .post(`/initiative/${joker}/follow/`)
      .set('Authorization', accessToken(account.user_id))
      .expect(422);
  });
  it('Should not follow an private initiative', async () => {
    const localWorkspace = await createFakeWorkspace(secundaryAccount._id, 'private');
    const localInitiative = await createFakeInitiative(secundaryAccount._id, localWorkspace._id);
    return supertest(app)
      .post(`/initiative/${localInitiative._id}/follow/`)
      .set('Authorization', accessToken(account.user_id))
      .expect(422);
  });
});

describe('DELETE /:initiative_id/unfollow/', () => {
  mongoServerInit();
  let account;
  let workspace;
  let initiative;

  beforeEach(async () => {
    account = await createFakeAccount();
    workspace = await createFakeWorkspace(account.user_id);
    initiative = await createFakeInitiative(account._id, workspace._id);
  });
  it('Should unfollow an initiative', () => {
    return supertest(app)
      .delete(`/initiative/${initiative._id}/unfollow/`)
      .set('Authorization', accessToken(account.user_id))
      .expect(204);
  });
  it('Should not unfollow an initiative without JWT', (done) => {
    return supertest(app)
      .delete(`/initiative/${initiative._id}/unfollow/`)
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not unfollow an initiative if id is wrong', () => {
    const joker = 'malware';
    return supertest(app)
      .delete(`/initiative/${joker}/unfollow/`)
      .set('Authorization', accessToken(account.user_id))
      .expect(422);
  });
});
