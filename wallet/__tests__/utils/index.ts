import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import faker from 'faker';
import {
  AccountModel,
  ComboModel,
  SubscriptionModel,
  SubscriptionProductModel,
  SubscriptionProductUsedModel,
  UserModel,
} from '../../src/database/mongoose';
import Seats from '../../src/modules/people/models/Seats';
import WorkspaceModel from '../../src/modules/workspace/models/Workspace';
import TeamModel from '../../src/modules/people/models/Team';

export const checkErrorPermission = (body) => {
  expect(JSON.parse(body)).toEqual(
    expect.objectContaining({
      message: 'Access forbidden',
      field_errors: expect.anything(),
    }),
  );
};
export const checkErrorSchema = (body, fieldErrors: string[]): void => {
  expect(['message', 'field_errors']).toEqual(
    expect.arrayContaining(Object.keys(JSON.parse(body))),
  );
  expect(Object.keys(JSON.parse(body).field_errors).sort()).toEqual(fieldErrors.sort());
};
export const checkErrorIdSchema = (body, fieldErrors: string, id: string): void => {
  expect(['message', 'field_errors']).toEqual(
    expect.arrayContaining(Object.keys(JSON.parse(body))),
  );
  expect(
    JSON.parse(body).field_errors[fieldErrors].find((errors) => errors.id === id),
  ).not.toBeUndefined();
};

export const checkBodySchema = (body, fields: string[]) => {
  expect(Object.keys(body).sort()).toEqual(fields.sort());
};

export const optionsMongoose = {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

export const accessToken = (_id?: string) => {
  const JWT_AUDIENCE = 'alvosoft.com.br';
  const JWT_ISSUER = 'accounts.alvosoft.com.br';
  const JWT_SECRET = process.env.JWT_SECRET;
  const JWT_EXPIRATION = 4 * 60 * 60;

  return `Bearer ${jwt.sign(
    {
      _id: _id ?? uuidv4(),
    },
    JWT_SECRET,
    {
      audience: JWT_AUDIENCE,
      issuer: JWT_ISSUER,
      expiresIn: JWT_EXPIRATION,
    },
  )}`;
};

export const mongoServerInit = () => {
  let mongoServer;

  beforeAll(async (done) => {
    mongoServer = new MongoMemoryServer();

    const mongoUri = await mongoServer.getUri();
    await mongoose.connect(mongoUri, optionsMongoose);
    done();
  });

  afterAll(async (done) => {
    await mongoServer.stop();
    mongoose.connection.close();
    done();
  });
};

export const createFakeAccount = async (wirecard_id?: string) => {
  const user = await UserModel.create({
    email: faker.internet.email(),
    name: faker.name.firstName() + faker.name.lastName(),
    password: 'Ab@12312',
    status: true,
    is_verified: true,
  });

  return await AccountModel.create({
    user_id: user._id,
    wirecard_id,
    currency: 'BRL',
  });
};

export const createFakeWorkspace = async (account_id: string, type_workspace = 'personal') => {
  return await mongoose.model('WorkSpace').create({
    name: 'Work Space 1',
    color: 'red',
    type_workspace,
    invites: [{ role: 'guest', name: 'nick', email: '0b83d3e258@firemailbox.club' }],
    account_id,
  });
};
export const createFakePermission = async (name) => {
  return await mongoose.model('Permission').create({ name });
};
/**
 *
 * @param permissions_id @type array
 * @returns
 */
export const createFakeProfile = async (permissions_id) => {
  return await mongoose.model('Profile').create({
    name: faker.name.findName(),
    permissions_id: permissions_id,
  });
};
/**
 *
 * @param workspace_id
 * @param account_id
 * @param profile_id
 * @returns
 */
export const createFakeInvite = async (workspace_id: string, account_id: string, profile_id) => {
  const workspace = await WorkspaceModel.findById(workspace_id);

  await createFakeSeat({
    invitedAccountId: account_id,
    account_id: workspace.account_id,
  });

  return await mongoose.model('WorkSpaceUser').create({
    workspace_id,
    account_id,
    profile_id,
  });
};
export const createFakeInitiative = async (account_id: string, workspace_id: string) => {
  return await mongoose.model('Initiatives').create({
    name: 'admin',
    describe: 'admin',
    duration_start: Date.now(),
    duration_end: Date.now(),
    copyright: false,
    highlight: false,
    account_id,
    workspaces: [workspace_id],
  });
};

export const createFakeSeat = async ({ account_id, invitedAccountId }) => {
  const seat = await Seats.findOne({
    account_id,
    invited_id: invitedAccountId,
  });

  if (!!seat === false) {
    return await Seats.create({
      account_id,
      invited_id: invitedAccountId,
    });
  }
  return seat;
};
export const createFakeSubscriptions = async (account_id: string, seats = 10, name = 'Grátis') => {
  const combo = await ComboModel.create({
    image_link: '',
    name: {
      'pt-BR': name,
    },
    description: {
      'pt-BR': faker.commerce.productDescription(),
    },
    features: {
      'pt-BR': [faker.commerce.productDescription()],
    },
  });

  const subscription = new SubscriptionModel({
    account_id,
    combo_id: combo._id,
  });

  await subscription.save();

  const subscriptionProductModel = new SubscriptionProductModel({
    subscription_id: subscription._id,
    quantity: seats,
    type: 'workspace',
  });
  await subscriptionProductModel.save();

  const subscriptionProductUsedModel = new SubscriptionProductUsedModel({
    subscription_id: subscription._id,
    quantity: 0,
    type: 'workspace',
  });
  await subscriptionProductUsedModel.save();
  return subscription;
};
export const createFakeTeam = async (account_id) => {
  return await TeamModel.create({
    owner_id: account_id,
    name: faker.name.jobTitle(),
    color: 'red',
  });
};
