/* eslint-disable @typescript-eslint/no-unused-vars */
import supertest from 'supertest';
import app from '../src/server';
import mongoose from 'mongoose';
import assert from 'assert';

//TODO teste com diferentes tipos de imagens

import {
  mongoServerInit,
  accessToken,
  createFakeAccount,
  createFakeWorkspace,
  createFakeInvite,
  createFakePermission,
  createFakeProfile,
  checkErrorSchema,
  checkErrorIdSchema,
  checkErrorPermission,
  createFakeSubscriptions,
  createFakeSeat,
} from './utils';
import { AccountModel } from '../src/database/mongoose';
import { svgBase64Image } from './utils/imageBase64';

describe('POST /', () => {
  mongoServerInit();
  let account;
  beforeEach(async () => {
    account = await createFakeAccount();
  });

  it('Should not create a workspace with wrong image', (done) => {
    const data = {
      name: 'workspace',
      color: 'red',
      storage: 5,
      type_workspace: 'private',
      profile_img_url: svgBase64Image,
      cover_img_url: svgBase64Image,
    };
    return supertest(app)
      .post('/workspace')
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .send(data)
      .expect(422)
      .then(async (response) => {
        checkErrorSchema(response.text, ['profile_img_url', 'cover_img_url']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not create a workspace without JWT', (done) => {
    return supertest(app)
      .post('/workspace')
      .set('Accept', 'application/json')
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });

  it('Should not create a workspace without required parameters', (done) => {
    return supertest(app)
      .post('/workspace')
      .set('Authorization', accessToken())
      .set('Accept', 'application/json')
      .send({})
      .expect(422)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        checkErrorSchema(response.text, ['name', 'color']);
        done();
      })
      .catch((err) => done(err));
  });

  it('Should not create a workspace with a wrong parameters', (done) => {
    return supertest(app)
      .post('/workspace')
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .send({
        name: '',
        color: null,
        storage: null,
        type_workspace: '',
        invites: [],
      })
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['name', 'color', 'storage', 'type_workspace', 'invites']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not create a new personal workspace if already have one', async (done) => {
    await mongoose.model('WorkSpace').create({
      name: 'Work Space 1',
      color: 'red',
      type_workspace: 'personal',
      account_id: account._id,
    });

    return supertest(app)
      .post('/workspace')
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .send({
        name: 'workspace',
        color: 'red',
        storage: 5,
        type_workspace: 'personal',
        invites: [],
      })
      .expect(422)
      .then((response) => {
        checkErrorIdSchema(response.text, 'type_workspace', 'exceeded-type_workspace');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });

  it('Should not create a public workspace with free plan', async (done) => {
    const data = {
      name: 'workspace',
      color: 'red',
      storage: 5,
      type_workspace: 'public',
    };
    await createFakeSubscriptions(account._id);
    return supertest(app)
      .post('/workspace')
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .send(data)
      .expect(422)
      .then(async (response) => {
        checkErrorIdSchema(response.text, 'type_workspace', 'invalid-type_workspace');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should create a new workspace', (done) => {
    const data = {
      name: 'workspace',
      color: 'red',
      storage: 5,
      type_workspace: 'private',
    };
    return supertest(app)
      .post('/workspace')
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .send(data)
      .expect(201)
      .then(async (response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            name: expect.any(String),
            color: expect.any(String),
            storage: expect.any(Number),
            account_id: expect.any(String),
            profile_img_url: null,
            cover_img_url: null,
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
  let account;

  beforeEach(async () => {
    account = await createFakeAccount();
  });
  it('Should list workpace', async (done) => {
    await createFakeWorkspace(account._id);
    return supertest(app)
      .get('/workspace')
      .set('Authorization', accessToken(account.user_id))
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
      .get('/workspace')
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('PATCH /workspace/profile/:workspace._id', () => {
  mongoServerInit();
  let account;
  let workspace;

  beforeEach(async () => {
    account = await createFakeAccount();
    workspace = await createFakeWorkspace(account._id);
  });

  it('Should not update workspace with wrong image', async (done) => {
    const localPermission = await createFakePermission('update_workspace');
    const localProfile = await createFakeProfile(localPermission._id);
    const localWorkspace = await createFakeWorkspace(String(mongoose.Types.ObjectId()));
    await createFakeInvite(localWorkspace._id, account._id, localProfile._id);
    const data = {
      profile_img_url: svgBase64Image,
      cover_img_url: svgBase64Image,
    };
    return supertest(app)
      .patch(`/workspace/profile/${localWorkspace._id}`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .send(data)
      .expect(422)
      .then(async (response) => {
        checkErrorSchema(response.text, ['profile_img_url', 'cover_img_url']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should update workspace', async (done) => {
    const localPermission = await createFakePermission('update_workspace');
    const localProfile = await createFakeProfile(localPermission._id);
    const localWorkspace = await createFakeWorkspace(String(mongoose.Types.ObjectId()));
    await createFakeInvite(localWorkspace._id, account._id, localProfile._id);
    const data = {
      name: 'workspace teste',
    };
    return supertest(app)
      .patch(`/workspace/profile/${localWorkspace._id}`)
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
  it('Should not update a guest workspace', async (done) => {
    const data = {
      name: 'workspace teste',
    };
    return supertest(app)
      .patch(`/workspace/profile/abc`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .send(data)
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['workspace_id']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not update workspace if not have permission', async (done) => {
    const localPermission = await createFakePermission('detail_workspace');
    const localProfile = await createFakeProfile(localPermission._id);
    const localWorkspace = await createFakeWorkspace(String(mongoose.Types.ObjectId()));
    await createFakeInvite(localWorkspace._id, account._id, localProfile._id);
    return supertest(app)
      .patch(`/workspace/profile/${localWorkspace._id}`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .send({
        name: 'workspace teste',
      })
      .expect(403)
      .then((response) => {
        checkErrorPermission(response.text);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not update workspace without JWT', (done) => {
    return supertest(app)
      .patch(`/workspace/profile/${workspace._id}`)
      .set('Accept', 'application/json')
      .send({
        name: 'teste',
      })
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not update workspace with wrong parameters', (done) => {
    return supertest(app)
      .patch(`/workspace/profile/${workspace._id}`)
      .set('Authorization', accessToken())
      .set('Accept', 'application/json')
      .send({
        name: '',
        type_workspace: '',
        storage: '',
      })
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['name', 'storage', 'type_workspace']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('DELETE /workspace/profile/:workspace._id', () => {
  mongoServerInit();
  let account;
  let workspace;

  beforeEach(async () => {
    account = await createFakeAccount();
    workspace = await createFakeWorkspace(account._id);
  });

  it('Should delete a workspace', async (done) => {
    const localPermission = await createFakePermission('delete_workspace');
    const localProfile = await createFakeProfile(localPermission._id);
    const localWorkspace = await createFakeWorkspace(String(mongoose.Types.ObjectId()));
    await createFakeInvite(localWorkspace._id, account._id, localProfile._id);
    return supertest(app)
      .delete(`/workspace/profile/${localWorkspace._id}`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .expect(204)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not delete a workspace if not have permission', async (done) => {
    const localPermission = await createFakePermission('list_workspace');
    const localProfile = await createFakeProfile(localPermission._id);
    const localWorkspace = await createFakeWorkspace(String(mongoose.Types.ObjectId()));
    await createFakeInvite(localWorkspace._id, account._id, localProfile._id);
    return supertest(app)
      .delete(`/workspace/profile/${localWorkspace._id}`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .expect(403)
      .then((response) => {
        checkErrorPermission(response.text);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not delete a workspace without JWT', async (done) => {
    const localPermission = await createFakePermission('delete_workspace');
    const localProfile = await createFakeProfile(localPermission._id);
    const localWorkspace = await createFakeWorkspace(String(mongoose.Types.ObjectId()));
    await createFakeInvite(localWorkspace._id, String(mongoose.Types.ObjectId()), localProfile._id);
    return supertest(app)
      .delete(`/workspace/profile/${localWorkspace._id}`)
      .set('Accept', 'application/json')
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not delete a guest workspace', async (done) => {
    return supertest(app)
      .delete(`/workspace/profile/${mongoose.Types.ObjectId()}`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['workspace_id']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('POST /:workspace_id/invites/', () => {
  mongoServerInit();
  let account;
  let workspace;
  let subscription;
  beforeEach(async () => {
    account = await createFakeAccount();
    workspace = await createFakeWorkspace(account._id);
    subscription = await createFakeSubscriptions(account._id);
  });

  it('Should create a new invite', async (done) => {
    const user = {
      _id: mongoose.Types.ObjectId(),
      email: 'teste@mobix.com',
      name: 'admin',
      password: 'Ab@12312',
      status: true,
      is_verified: true,
    };
    await AccountModel.create({
      user_id: user._id,
      currency: 'BRL',
    });

    const localPermission = await createFakePermission('create_workspace_user');
    const localProfile = await createFakeProfile(localPermission._id);
    const localWorkspace = await createFakeWorkspace(account._id);
    return supertest(app)
      .post(`/workspace/${localWorkspace._id}/invites/`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .send({
        invites: [
          {
            profile_id: `${localProfile._id}`,
            email: `teste@mobix.com`,
          },
        ],
      })
      .expect(204)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  it('Should not create a new invite if not have permission', async (done) => {
    const user = {
      _id: mongoose.Types.ObjectId(),
      email: 'teste@mobix.com',
      name: 'admin',
      password: 'Ab@12312',
      status: true,
      is_verified: true,
    };
    await AccountModel.create({
      user_id: user._id,
      currency: 'BRL',
    });
    const localPermission = await createFakePermission('list_workspace_user');
    const localProfile = await createFakeProfile(localPermission._id);
    const localWorkspace = await createFakeWorkspace(String(mongoose.Types.ObjectId()));
    await createFakeInvite(localWorkspace._id, account._id, localProfile._id);

    return supertest(app)
      .post(`/workspace/${localWorkspace._id}/invites/`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .send({
        invites: [
          {
            profile_id: `${localProfile._id}`,
            email: `teste@mobix.com`,
          },
        ],
      })
      .expect(403)
      .then((response) => {
        checkErrorPermission(response.text);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });

  it('Should not create a new invite without JWT', (done) => {
    return supertest(app)
      .post(`/workspace/${workspace._id}/invites/`)
      .set('Accept', 'application/json')
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('should not create a new invite with a wrong parameters', (done) => {
    return supertest(app)
      .post(`/workspace/${workspace._id}/invites/`)
      .set('Authorization', accessToken())
      .set('Accept', 'application/json')
      .send({
        invites: [
          {
            name: '',
            profile_id: '',
            email: '',
          },
        ],
      })
      .expect(422)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});
describe('GET /:workspace_id/invites/', () => {
  mongoServerInit();
  let account;
  let workspace;
  beforeEach(async () => {
    account = await createFakeAccount();
    workspace = await createFakeWorkspace(account._id);
  });

  it('should list invites', async (done) => {
    const user = {
      _id: mongoose.Types.ObjectId(),
      email: 'teste@mobix.com',
      name: 'admin',
      password: 'Ab@12312',
      status: true,
      is_verified: true,
    };
    await AccountModel.create({
      user_id: user._id,
      currency: 'BRL',
    });
    const localPermission = await createFakePermission('list_workspace_user');
    const localProfile = await createFakeProfile(localPermission._id);
    const localWorkspace = await createFakeWorkspace(String(mongoose.Types.ObjectId()));
    await createFakeInvite(localWorkspace._id, account._id, localProfile._id);
    return supertest(app)
      .get(`/workspace/${localWorkspace._id}/invites/`)
      .set('Authorization', accessToken(account.user_id))
      .expect(200)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        expect(response.body).toEqual(expect.not.arrayContaining(['']));
        done();
      })
      .catch((err) => done(err));
  });
  it('should not list invites if not have permission', async (done) => {
    const user = {
      _id: mongoose.Types.ObjectId(),
      email: 'teste@mobix.com',
      name: 'admin',
      password: 'Ab@12312',
      status: true,
      is_verified: true,
    };
    await AccountModel.create({
      user_id: user._id,
      currency: 'BRL',
    });
    const localPermission = await createFakePermission('follow_workspace');
    const localProfile = await createFakeProfile(localPermission._id);
    const localWorkspace = await createFakeWorkspace(String(mongoose.Types.ObjectId()));
    await createFakeInvite(localWorkspace._id, account._id, localProfile._id);
    return supertest(app)
      .get(`/workspace/${localWorkspace._id}/invites/`)
      .set('Authorization', accessToken(account.user_id))
      .expect(403)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        checkErrorPermission(response.text);
        done();
      })
      .catch((err) => done(err));
  });
  it('should not list invites without jwt', (done) => {
    return supertest(app)
      .get(`/workspace/${workspace._id}/invites/`)
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});
describe('PATCH /:workspace_id/invites/:invite_id/accept/', () => {
  mongoServerInit();
  let account;
  let workspace;
  beforeEach(async () => {
    mongoose.connection.dropDatabase();
    account = await createFakeAccount();
    workspace = await createFakeWorkspace(account._id);
  });

  it('should accept a invite', async (done) => {
    const user = {
      _id: mongoose.Types.ObjectId(),
      email: 'teste@mobix.com',
      name: 'admin',
      password: 'Ab@12312',
      status: true,
      is_verified: true,
    };
    await AccountModel.create({
      user_id: user._id,
      currency: 'BRL',
    });
    const localPermission = await createFakePermission('list_workspace_user');
    const localProfile = await createFakeProfile(localPermission._id);
    const localWorkspace = await createFakeWorkspace(String(mongoose.Types.ObjectId()));
    const fakeInvite = await createFakeInvite(localWorkspace._id, account._id, localProfile._id);
    return supertest(app)
      .patch(`/workspace/${localWorkspace._id}/invites/${fakeInvite._id}/accept/`)
      .set('Authorization', accessToken(account.user_id))
      .expect(204)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  }, 30000);
  it('should not accept an invite if not is you', async (done) => {
    const user = {
      _id: mongoose.Types.ObjectId(),
      email: 'teste@mobix.com',
      name: 'admin',
      password: 'Ab@12312',
      status: true,
      is_verified: true,
    };
    await AccountModel.create({
      user_id: user._id,
      currency: 'BRL',
    });
    const localPermission = await createFakePermission('list_workspace_user');
    const localProfile = await createFakeProfile(localPermission._id);
    const localWorkspace = await createFakeWorkspace(String(mongoose.Types.ObjectId()));
    const fakeInvite = await createFakeInvite(
      localWorkspace._id,
      String(mongoose.Types.ObjectId()),
      localProfile._id,
    );
    return supertest(app)
      .patch(`/workspace/${localWorkspace._id}/invites/${fakeInvite._id}/accept/`)
      .set('Authorization', accessToken(account.user_id))
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['invite_id']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('should reject a invite', async (done) => {
    await createFakeSubscriptions(account._id);
    const user = {
      _id: mongoose.Types.ObjectId(),
      email: 'teste@mobix.com',
      name: 'admin',
      password: 'Ab@12312',
      status: true,
      is_verified: true,
    };
    await AccountModel.create({
      user_id: user._id,
      currency: 'BRL',
    });
    const localPermission = await createFakePermission('list_workspace_user');
    const localProfile = await createFakeProfile(localPermission._id);
    const ownerWorkspaceAccount = await createFakeAccount();
    const localWorkspace = await createFakeWorkspace(ownerWorkspaceAccount._id);
    const fakeInvite = await createFakeInvite(localWorkspace._id, account._id, localProfile._id);
    return supertest(app)
      .patch(`/workspace/${localWorkspace._id}/invites/${fakeInvite._id}/reject/`)
      .set('Authorization', accessToken(account.user_id))
      .expect(204)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });

  it('should not accept or reject a invite without jwt', async (done) => {
    const user = {
      _id: mongoose.Types.ObjectId(),
      email: 'teste@mobix.com',
      name: 'admin',
      password: 'Ab@12312',
      status: true,
      is_verified: true,
    };
    await AccountModel.create({
      user_id: user._id,
      currency: 'BRL',
    });
    const localPermission = await createFakePermission('list_workspace_user');
    const localProfile = await createFakeProfile(localPermission._id);
    const localWorkspace = await createFakeWorkspace(String(mongoose.Types.ObjectId()));
    const fakeInvite = await createFakeInvite(localWorkspace._id, account._id, localProfile._id);

    await supertest(app)
      .patch(`/workspace/${workspace._id}/invites/${fakeInvite._id}/accept/`)
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
    await supertest(app)
      .patch(`/workspace/${workspace._id}/invites/${fakeInvite._id}/reject/`)
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});
describe('PATCH /:workspace_id/activate/', () => {
  mongoServerInit();
  let account;
  let workspace;
  beforeEach(async () => {
    account = await createFakeAccount();
    workspace = await createFakeWorkspace(account._id);
  });
  it('should active a workspace', async (done) => {
    const user = {
      _id: mongoose.Types.ObjectId(),
      email: 'teste@mobix.com',
      name: 'admin',
      password: 'Ab@12312',
      status: true,
      is_verified: true,
    };
    await AccountModel.create({
      user_id: user._id,
      currency: 'BRL',
    });
    const localPermission = await createFakePermission('active_workspace');
    const localProfile = await createFakeProfile(localPermission._id);
    const localWorkspace = await createFakeWorkspace(String(mongoose.Types.ObjectId()));
    await createFakeInvite(localWorkspace._id, account._id, localProfile._id);
    return supertest(app)
      .patch(`/workspace/${localWorkspace._id}/activate/`)
      .set('Authorization', accessToken(account.user_id))
      .expect(200)
      .then((response) => {
        expect(response.body.active).toBe(true);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((error) => done(error));
  });
  it('should not active a workspace if not have permission', async (done) => {
    const user = {
      _id: mongoose.Types.ObjectId(),
      email: 'teste@mobix.com',
      name: 'admin',
      password: 'Ab@12312',
      status: true,
      is_verified: true,
    };
    await AccountModel.create({
      user_id: user._id,
      currency: 'BRL',
    });
    const localPermission = await createFakePermission('deactive_workspace');
    const localProfile = await createFakeProfile(localPermission._id);
    const localWorkspace = await createFakeWorkspace(String(mongoose.Types.ObjectId()));
    await createFakeInvite(localWorkspace._id, account._id, localProfile._id);
    return supertest(app)
      .patch(`/workspace/${localWorkspace._id}/activate/`)
      .set('Authorization', accessToken(account.user_id))
      .expect(403)
      .then((response) => {
        checkErrorPermission(response.text);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((error) => done(error));
  });
  it('should not active a workspace if workspace not found', (done) => {
    return supertest(app)
      .patch(`/workspace/acbd/activate/`)
      .set('Authorization', accessToken())
      .expect(422)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        checkErrorSchema(response.text, ['workspace_id']);
        done();
      })
      .catch((error) => done(error));
  });
  it('should not active a workspace without jwt', async (done) => {
    return supertest(app)
      .patch(`/workspace/acbd/activate/`)
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((error) => done(error));
  });
});
describe('PATCH /:workspace_id/deactivate/', () => {
  mongoServerInit();
  let account;
  let workspace;
  beforeEach(async () => {
    account = await createFakeAccount();
    workspace = await createFakeWorkspace(account._id);
  });

  it('should deactive a workspace', async (done) => {
    const user = {
      _id: mongoose.Types.ObjectId(),
      email: 'teste@mobix.com',
      name: 'admin',
      password: 'Ab@12312',
      status: true,
      is_verified: true,
    };
    await AccountModel.create({
      user_id: user._id,
      currency: 'BRL',
    });
    const localPermission = await createFakePermission('deactive_workspace');
    const localProfile = await createFakeProfile(localPermission._id);
    const localWorkspace = await createFakeWorkspace(String(mongoose.Types.ObjectId()));
    await createFakeInvite(localWorkspace._id, account._id, localProfile._id);
    return supertest(app)
      .patch(`/workspace/${localWorkspace._id}/deactivate/`)
      .set('Authorization', accessToken(account.user_id))
      .expect(200)
      .then((response) => {
        expect(response.body.active).toBe(false);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((error) => done(error));
  });
  it('should not deactive a workspace without jwt', (done) => {
    return supertest(app)
      .patch(`/workspace/acbd/deactivate/`)
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((error) => done(error));
  });
  it('Should not deactive a workspace if not have permission', async (done) => {
    const user = {
      _id: mongoose.Types.ObjectId(),
      email: 'teste@mobix.com',
      name: 'admin',
      password: 'Ab@12312',
      status: true,
      is_verified: true,
    };
    await AccountModel.create({
      user_id: user._id,
      currency: 'BRL',
    });
    const localPermission = await createFakePermission('active_workspace');
    const localProfile = await createFakeProfile(localPermission._id);
    const localWorkspace = await createFakeWorkspace(String(mongoose.Types.ObjectId()));
    await createFakeInvite(localWorkspace._id, account._id, localProfile._id);
    return supertest(app)
      .patch(`/workspace/${localWorkspace._id}/deactivate/`)
      .set('Authorization', accessToken(account.user_id))
      .expect(403)
      .then((response) => {
        checkErrorPermission(response.text);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((error) => done(error));
  });
  it('should not deactive a workspace if workspace not found', (done) => {
    return supertest(app)
      .patch(`/workspace/acbd/deactivate/`)
      .set('Authorization', accessToken())
      .expect(422)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        checkErrorSchema(response.text, ['workspace_id']);
        done();
      })
      .catch((error) => done(error));
  });
});

describe('GET /invites', () => {
  mongoServerInit();
  let account;
  beforeEach(async () => {
    account = await createFakeAccount();
  });

  it('should not list invites without JWT', (done) => {
    return supertest(app)
      .get(`/workspace/invites`)
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((error) => done(error));
  });
  it('should list invites', (done) => {
    return supertest(app)
      .get(`/workspace/invites`)
      .set('Authorization', accessToken(account.user_id))
      .expect(200)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        expect(response.body).toEqual(expect.not.arrayContaining(['']));
        done();
      })
      .catch((err) => done(err));
  });
});

describe('DELETE /:workspace_id/invites/exit', () => {
  mongoServerInit();

  let account;
  let workspace;
  beforeEach(async () => {
    mongoose.connection.dropDatabase();
    account = await createFakeAccount();
    workspace = await createFakeWorkspace(account.user_id);
  });

  it('Should exit at workspace', async (done) => {
    const handleFakeId = String(mongoose.Types.ObjectId());
    await createFakeSubscriptions(account._id);
    await createFakeSubscriptions(handleFakeId);

    const localPermission = await createFakePermission('list_workspace_user');
    const localProfile = await createFakeProfile(localPermission._id);
    const localWorkspace = await createFakeWorkspace(handleFakeId);
    await createFakeInvite(localWorkspace._id, account._id, localProfile._id);

    return supertest(app)
      .delete(`/workspace/${localWorkspace._id}/invites/exit`)
      .set('Authorization', accessToken(account.user_id))
      .expect(204)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not exit at workspace without JWT', async (done) => {
    const localPermission = await createFakePermission('list_workspace_user');
    const localProfile = await createFakeProfile(localPermission._id);
    const localWorkspace = await createFakeWorkspace(String(mongoose.Types.ObjectId()));
    await createFakeInvite(localWorkspace._id, account._id, localProfile._id);
    return supertest(app)
      .delete(`/workspace/${localWorkspace._id}/invites/exit`)
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});
describe('DELETE /invites/:invite_id/delete', () => {
  mongoServerInit();

  let account;
  let workspace;
  beforeEach(async () => {
    mongoose.connection.dropDatabase();
    account = await createFakeAccount();
    workspace = await createFakeWorkspace(account.user_id);
  });
  it('should delete a invite', async (done) => {
    await createFakeSubscriptions(account._id);
    const user = {
      _id: mongoose.Types.ObjectId(),
      email: 'teste@mobix.com',
      name: 'admin',
      password: 'Ab@12312',
      status: true,
      is_verified: true,
    };
    const accountInvite = await createFakeAccount();
    const localPermission = await createFakePermission('delete_workspace_user');
    const localProfile = await createFakeProfile(localPermission._id);
    const localWorkspace = await createFakeWorkspace(account._id);
    const localInvite = await createFakeInvite(
      localWorkspace._id,
      accountInvite._id,
      localProfile._id,
    );
    return supertest(app)
      .delete(`/workspace/${localWorkspace._id}/invites/${localInvite._id}/delete`)
      .set('Authorization', accessToken(account.user_id))
      .expect(204)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });

  it('should not delete a invite without JWT', async (done) => {
    const user = {
      _id: mongoose.Types.ObjectId(),
      email: 'teste@mobix.com',
      name: 'admin',
      password: 'Ab@12312',
      status: true,
      is_verified: true,
    };
    await AccountModel.create({
      user_id: user._id,
      currency: 'BRL',
    });
    const localPermission = await createFakePermission('deative_workspace');
    const localProfile = await createFakeProfile(localPermission._id);
    const localWorkspace = await createFakeWorkspace(String(mongoose.Types.ObjectId()));
    const localInvite = await createFakeInvite(localWorkspace._id, account._id, localProfile._id);
    return supertest(app)
      .delete(`/workspace/${localWorkspace._id}/invites/${localInvite._id}/delete`)
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });

  it('should not delete a non-existent invite ', async (done) => {
    const localPermission = await createFakePermission('active_workspace');
    const localProfile = await createFakeProfile(localPermission._id);
    const localWorkspace = await createFakeWorkspace(String(mongoose.Types.ObjectId()));
    await createFakeInvite(localWorkspace._id, account._id, localProfile._id);
    return supertest(app)
      .delete(`/workspace/${localWorkspace._id}/invites/<script>alert('xss attack')<script>/delete`)
      .set('Authorization', accessToken(account.user_id))
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['invite_id']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  }, 30000);

  it('should not delete an invite if not have permission', async (done) => {
    const localPermission = await createFakePermission('active_workspace');
    const localProfile = await createFakeProfile(localPermission._id);
    const localWorkspace = await createFakeWorkspace(String(mongoose.Types.ObjectId()));
    const localInvite = await createFakeInvite(localWorkspace._id, account._id, localProfile._id);
    return supertest(app)
      .delete(`/workspace/${localWorkspace._id}/invites/${localInvite._id}/delete`)
      .set('Authorization', accessToken(account.user_id))
      .expect(403)
      .then((response) => {
        checkErrorPermission(response.text);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});
describe('GET /follows', () => {
  mongoServerInit();
  let account;

  beforeEach(async () => {
    account = await createFakeAccount();
  });

  it('Should list follows workspaces', (done) => {
    return supertest(app)
      .get('/workspace/follows')
      .set('Authorization', accessToken(account.user_id))
      .expect(200)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        expect(response.body).toEqual(expect.not.arrayContaining(['']));
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not list follows workspaces without JWT', (done) => {
    return supertest(app)
      .get('/workspace/follows')
      .expect(401)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        expect(response.text).toEqual('Unauthorized');
        done();
      })
      .catch((err) => done(err));
  });
});
describe('POST /:workspace_id/follow', () => {
  mongoServerInit();
  let account;
  let workspace;

  beforeEach(async () => {
    account = await createFakeAccount();
    workspace = await createFakeWorkspace(account.user_id);
  });

  it('Should follow a workspace', async () => {
    const user = {
      _id: mongoose.Types.ObjectId(),
      email: 'teste@mobix.com',
      name: 'admin',
      password: 'Ab@12312',
      status: true,
      is_verified: true,
    };
    await AccountModel.create({
      user_id: user._id,
      currency: 'BRL',
    });
    const localPermission = await createFakePermission('follow_workspace');
    const localProfile = await createFakeProfile(localPermission._id);
    const localWorkspace = await createFakeWorkspace(String(mongoose.Types.ObjectId()));
    await createFakeInvite(localWorkspace._id, account._id, localProfile._id);
    return supertest(app)
      .post(`/workspace/${localWorkspace._id}/follow`)
      .set('Authorization', accessToken(account.user_id))
      .expect(204);
  });

  it('Should not follow workspace without JWT', (done) => {
    return supertest(app)
      .post(`/workspace/${workspace._id}/follow`)
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });

  it('Should not follow a workspace if not have permission', async (done) => {
    const user = {
      _id: mongoose.Types.ObjectId(),
      email: 'teste@mobix.com',
      name: 'admin',
      password: 'Ab@12312',
      status: true,
      is_verified: true,
    };
    await AccountModel.create({
      user_id: user._id,
      currency: 'BRL',
    });
    const localPermission = await createFakePermission('list_workspace');
    const localProfile = await createFakeProfile(localPermission._id);
    const localWorkspace = await createFakeWorkspace(String(mongoose.Types.ObjectId()));
    await createFakeInvite(localWorkspace._id, account._id, localProfile._id);
    return supertest(app)
      .post(`/workspace/${localWorkspace._id}/follow`)
      .set('Authorization', accessToken(account.user_id))
      .expect(403)
      .then((response) => {
        checkErrorPermission(response.text);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('DELETE /workspace_id/unfollow', () => {
  mongoServerInit();
  let account;
  let workspace;

  beforeEach(async () => {
    account = await createFakeAccount();
    workspace = await createFakeWorkspace(account._id);
  });

  it('Should unfollow a workspace', async (done) => {
    const user = {
      _id: mongoose.Types.ObjectId(),
      email: 'teste@mobix.com',
      name: 'admin',
      password: 'Ab@12312',
      status: true,
      is_verified: true,
    };
    await AccountModel.create({
      user_id: user._id,
      currency: 'BRL',
    });
    const localPermission = await createFakePermission('follow_workspace');
    const localProfile = await createFakeProfile(localPermission._id);
    const localWorkspace = await createFakeWorkspace(String(mongoose.Types.ObjectId()));
    await createFakeInvite(localWorkspace._id, account._id, localProfile._id);
    return supertest(app)
      .post(`/workspace/${localWorkspace._id}/unfollow`)
      .set('Authorization', accessToken(account.user_id))
      .expect(204)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });

  it('Should not unfollow workspace without JWT', (done) => {
    return supertest(app)
      .post(`/workspace/${workspace._id}/unfollow`)
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toBe('close');
        done();
      })
      .catch((err) => done(err));
  });

  it('Should not unfollow a workspace if not have permission ', async (done) => {
    const user = {
      _id: mongoose.Types.ObjectId(),
      email: 'teste@mobix.com',
      name: 'admin',
      password: 'Ab@12312',
      status: true,
      is_verified: true,
    };
    await AccountModel.create({
      user_id: user._id,
      currency: 'BRL',
    });
    const localPermission = await createFakePermission('list_workspace');
    const localProfile = await createFakeProfile(localPermission._id);
    const localWorkspace = await createFakeWorkspace(String(mongoose.Types.ObjectId()));
    await createFakeInvite(localWorkspace._id, account._id, localProfile._id);
    return supertest(app)
      .post(`/workspace/${localWorkspace._id}/unfollow`)
      .set('Authorization', accessToken(account.user_id))
      .expect(403)
      .then((response) => {
        checkErrorPermission(response.text);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('PATCH /:workspace_id/transfer/:account_id/', () => {
  mongoServerInit();
  let account;
  beforeEach(async () => {
    account = await createFakeAccount();
  });

  it('Should transfer workspace', async (done) => {
    const localAccountId = await createFakeAccount();
    const localWorkspace = await createFakeWorkspace(account._id);

    return supertest(app)
      .patch(`/workspace/${localWorkspace._id}/transfer/${localAccountId._id}/`)
      .set('Authorization', accessToken(account.user_id))
      .expect(204)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not transfer workspace without JWT', async (done) => {
    const localAccountId = await createFakeAccount();
    const localWorkspace = await createFakeWorkspace(account._id);
    return supertest(app)
      .patch(`/workspace/${localWorkspace._id}/transfer/${localAccountId._id}/`)
      .expect(401)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });

  it('Should not transfer workspace with nonexistent account id', async (done) => {
    const localWorkspace = await createFakeWorkspace(account._id);
    return supertest(app)
      .patch(`/workspace/${localWorkspace._id}/transfer/${mongoose.Types.ObjectId()}/`)
      .set('Authorization', accessToken(account.user_id))
      .expect(422)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not transfer a nonexistent workspace', async (done) => {
    const localAccountId = await createFakeAccount();
    return supertest(app)
      .patch(`/workspace/${mongoose.Types.ObjectId()}/transfer/${localAccountId._id}/`)
      .set('Authorization', accessToken(account.user_id))
      .expect(422)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});
