import supertest from 'supertest';
import app from '../src/server';
import mongoose from 'mongoose';
import faker from 'faker';

import {
  mongoServerInit,
  accessToken,
  createFakeAccount,
  createFakeWorkspace,
  createFakeInitiative,
  createFakeSubscriptions,
  createFakeSeat,
  createFakeTeam,
} from './utils';
import { AccountModel, UserModel } from '../src/database/mongoose';

const ROCKET_DEFAULT_AVATAR_TEAM =
  'https://images.ctfassets.net/v94vaxiakdqx/6LU79BtwzadJdDyDwSSU2T/dda203a2d9133aa8e639cc306b7d31c9/objects-20.png';

describe('POST /team', () => {
  mongoServerInit();
  let account;
  beforeEach(async () => {
    account = await createFakeAccount();
  });

  it('Should create a new team', (done) => {
    return supertest(app)
      .post('/people/team/')
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .send({
        name: faker.name.jobTitle(),
        color: 'red',
        image: ROCKET_DEFAULT_AVATAR_TEAM,
      })
      .expect(201)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not create a new team without JWT', (done) => {
    return supertest(app)
      .post('/people/team/')
      .set('Accept', 'application/json')
      .send({
        name: faker.name.jobTitle(),
        color: 'red',
        image: ROCKET_DEFAULT_AVATAR_TEAM,
      })
      .expect(401)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should create a new team with invite', async (done) => {
    const localAccount = await createFakeAccount();
    const localUser = await UserModel.findById(localAccount.user_id);
    return supertest(app)
      .post('/people/team/')
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .send({
        name: faker.name.jobTitle(),
        color: 'red',
        invites: [localUser.email],
        image: ROCKET_DEFAULT_AVATAR_TEAM,
      })
      .expect(201)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not create a new team with wrong values', (done) => {
    return supertest(app)
      .post('/people/team/')
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .send({
        name: null,
        color: ['red'],
        image: ROCKET_DEFAULT_AVATAR_TEAM,
      })
      .expect(422)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('GET /team', () => {
  mongoServerInit();
  let account;
  beforeEach(async () => {
    account = await createFakeAccount();
  });

  it('Should list team', (done) => {
    return supertest(app)
      .get('/people/team')
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .expect(200)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('should not list team without JWT', (done) => {
    return supertest(app)
      .get('/people/team')
      .set('Accept', 'application/json')
      .expect(401)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('should not list team with wrong query value', (done) => {
    return supertest(app)
      .get('/people/team')
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .query({ page: null, limit: null })
      .expect(422)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('GET /team/:team_id/', () => {
  mongoServerInit();
  let account;
  let team;
  beforeEach(async () => {
    account = await createFakeAccount();
    team = await createFakeTeam(account._id);
  });

  it('Should detail a team', (done) => {
    return supertest(app)
      .get(`/people/team/${team._id}`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .expect(200)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not detail a team without JWT', (done) => {
    return supertest(app)
      .get(`/people/team/${team._id}`)
      .set('Accept', 'application/json')
      .expect(401)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not detail a nonexistent team', (done) => {
    return supertest(app)
      .get(`/people/team/${mongoose.Types.ObjectId()}`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .expect(422)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('PATH /team/:team_id', () => {
  mongoServerInit();
  let account;
  let team;
  beforeEach(async () => {
    account = await createFakeAccount();
    team = await createFakeTeam(account._id);
  });

  it('Should update a team', (done) => {
    return supertest(app)
      .patch(`/people/team/${team._id}`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .send({
        name: faker.name.jobTitle(),
      })
      .expect(200)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });

  it('Should not update a team without JWT', (done) => {
    return supertest(app)
      .patch(`/people/team/${team._id}`)
      .set('Accept', 'application/json')
      .send({
        name: faker.name.jobTitle(),
      })
      .expect(401)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });

  it('Should not update a team with wrong values', (done) => {
    return supertest(app)
      .patch(`/people/team/${team._id}`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .send({
        name: null,
      })
      .expect(422)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('DELETE /team/:team_id', () => {
  mongoServerInit();
  let account;
  let team;
  beforeEach(async () => {
    account = await createFakeAccount();
    team = await createFakeTeam(account._id);
  });

  it('Should delete a team', (done) => {
    return supertest(app)
      .delete(`/people/team/${team._id}`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .expect(204)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });

  it('Should not delete a nonexistent team', (done) => {
    return supertest(app)
      .delete(`/people/team/${mongoose.Types.ObjectId()}`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .expect(422)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('POST /team/:team_id/workspace/:workspace_id', () => {
  mongoServerInit();
  let account;
  let workspace;
  let team;
  beforeEach(async () => {
    account = await createFakeAccount();
    workspace = await createFakeWorkspace(account._id);
    team = await createFakeTeam(account._id);
  });

  it('Should insert team in workspace', async (done) => {
    await createFakeSubscriptions(account._id);
    return supertest(app)
      .post(`/people/team/${team._id}/workspace/${workspace._id}`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .expect(204)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not insert team in workspace without JWT', async (done) => {
    await createFakeSubscriptions(account._id);
    return supertest(app)
      .post(`/people/team/${team._id}/workspace/${workspace._id}`)
      .set('Accept', 'application/json')
      .expect(401)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });

  it('Should not insert team in workspace if no have seats enough', async (done) => {
    await createFakeSubscriptions(account._id, 0);
    return supertest(app)
      .post(`/people/team/${team._id}/workspace/${workspace._id}`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .expect(422)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });

  it('Should not insert an nonexistent team in workspace', async (done) => {
    await createFakeSubscriptions(account._id);
    return supertest(app)
      .post(`/people/team/${mongoose.Types.ObjectId()}/workspace/${workspace._id}`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .expect(422)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not insert a team in nonexistent workspace', async (done) => {
    await createFakeSubscriptions(account._id);
    return supertest(app)
      .post(`/people/team/${team._id}/workspace/${mongoose.Types.ObjectId()}`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .expect(422)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('DELETE /team/:team_id/workspace/:workspace_id', () => {
  mongoServerInit();
  let account;
  let workspace;
  let team;
  beforeEach(async () => {
    account = await createFakeAccount();
    workspace = await createFakeWorkspace(account._id);
    team = await createFakeTeam(account._id);
  });

  it('Should remove team in workspace', (done) => {
    return supertest(app)
      .delete(`/people/team/${team._id}/workspace/${workspace._id}`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .expect(204)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not remove team in workspace without JWT', (done) => {
    return supertest(app)
      .delete(`/people/team/${team._id}/workspace/${workspace._id}`)
      .set('Accept', 'application/json')
      .expect(401)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not remove a nonexistent team in workspace', (done) => {
    return supertest(app)
      .delete(`/people/team/${mongoose.Types.ObjectId()}/workspace/${workspace._id}`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .expect(422)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not remove a team in nonexistent workspace', (done) => {
    return supertest(app)
      .delete(`/people/team/${team._id}/workspace/${mongoose.Types.ObjectId()}`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .expect(422)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('POST /team/:team_id/initiative/:initiative_id', () => {
  mongoServerInit();
  let account;
  let workspace;
  let initiative;
  let team;

  beforeEach(async () => {
    account = await createFakeAccount();
    workspace = await createFakeWorkspace(account._id);
    initiative = await createFakeInitiative(account._id, workspace._id);
    team = await createFakeTeam(account._id);
    await createFakeSubscriptions(account._id);
  });

  it('Should insert team in initiative', (done) => {
    return supertest(app)
      .post(`/people/team/${team._id}/initiative/${initiative._id}`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .expect(204)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not insert team in initiative without JWT', (done) => {
    return supertest(app)
      .post(`/people/team/${team._id}/initiative/${initiative._id}`)
      .set('Accept', 'application/json')
      .expect(401)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not insert a nonexistent team in initiative', (done) => {
    return supertest(app)
      .post(`/people/team/${mongoose.Types.ObjectId()}/initiative/${initiative._id}`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .expect(422)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not insert a team in nonexistent initiative', (done) => {
    return supertest(app)
      .post(`/people/team/${team._id}/initiative/${mongoose.Types.ObjectId()}`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .expect(422)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('POST /team/:team_id/invite/:account_id', () => {
  mongoServerInit();
  let account;
  let team;

  beforeEach(async () => {
    account = await createFakeAccount();
    await createFakeSubscriptions(account._id);
    await createFakeWorkspace(account._id);
    team = await createFakeTeam(account._id);
  });

  it('Should create a new team user', async (done) => {
    const localAccount = await createFakeAccount();
    return supertest(app)
      .post(`/people/team/${team._id}/invite/${localAccount._id}/`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .expect(204)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not create a new team user without JWT', async (done) => {
    const localAccount = await createFakeAccount();
    return supertest(app)
      .post(`/people/team/${team._id}/invite/${localAccount._id}/`)
      .set('Accept', 'application/json')
      .expect(401)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not create a nonexistent team user', async (done) => {
    const localAccount = await createFakeAccount();
    return supertest(app)
      .post(`/people/team/${mongoose.Types.ObjectId()}/invite/${localAccount._id}/`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .expect(422)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not create a team user with nonexistent account_id', async (done) => {
    return supertest(app)
      .post(`/people/team/${team._id}/invite/${mongoose.Types.ObjectId()}/`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .expect(422)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('DELETE /team/:team_id/invite/:account_id', () => {
  mongoServerInit();
  let account;
  let team;

  beforeEach(async () => {
    account = await createFakeAccount();
    await createFakeSubscriptions(account._id);
    await createFakeWorkspace(account._id);
    team = await createFakeTeam(account._id);
  });

  it('Should delete a team user', async (done) => {
    const localAccount = await createFakeAccount();
    await createFakeSeat({ account_id: account._id, invitedAccountId: localAccount._id });
    return supertest(app)
      .delete(`/people/team/${team._id}/invite/${localAccount._id}/`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .expect(204)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not delete a team user without JWT', async (done) => {
    const localAccount = await createFakeAccount();
    await createFakeSeat({ account_id: account._id, invitedAccountId: localAccount._id });
    return supertest(app)
      .delete(`/people/team/${team._id}/invite/${localAccount._id}/`)
      .set('Accept', 'application/json')
      .expect(401)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not delete a team user with nonexistent team_id', async (done) => {
    const localAccount = await createFakeAccount();
    await createFakeSeat({ account_id: account._id, invitedAccountId: localAccount._id });
    return supertest(app)
      .delete(`/people/team/${mongoose.Types.ObjectId()}/invite/${localAccount._id}/`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .expect(422)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not delete a team user with nonexistent account_id', async (done) => {
    const localAccount = await createFakeAccount();
    await createFakeSeat({ account_id: account._id, invitedAccountId: localAccount._id });
    return supertest(app)
      .delete(`/people/team/${team._id}/invite/${mongoose.Types.ObjectId()}/`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .expect(422)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
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

  it('Should list people', (done) => {
    return supertest(app)
      .get('/people/')
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .expect(200)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not list people without JWT', (done) => {
    return supertest(app)
      .get('/people/')
      .set('Accept', 'application/json')
      .expect(401)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('GET /seat/', () => {
  mongoServerInit();
  let account;

  beforeEach(async () => {
    account = await createFakeAccount();
  });

  it('Should view seats', (done) => {
    return supertest(app)
      .get('/people/seat/')
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .expect(200)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not view seats without jwt', (done) => {
    return supertest(app)
      .get('/people/seat/')
      .set('Accept', 'application/json')
      .expect(401)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('DELETE /seat/:account_id', () => {
  mongoServerInit();
  let account;

  beforeEach(async () => {
    account = await createFakeAccount();
  });

  it('Should remove a seat', async (done) => {
    const localAccount = await createFakeAccount();
    await createFakeSeat({ account_id: account._id, invitedAccountId: localAccount._id });
    return supertest(app)
      .delete(`/people/seat/${localAccount._id}`)
      .set('Authorization', accessToken(account.user_id))
      .set('Accept', 'application/json')
      .expect(204)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not remove a seat without JWT', async (done) => {
    const localAccount = await createFakeAccount();
    await createFakeSeat({ account_id: account._id, invitedAccountId: localAccount._id });
    return supertest(app)
      .delete(`/people/seat/${localAccount._id}`)
      .set('Accept', 'application/json')
      .expect(401)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});
