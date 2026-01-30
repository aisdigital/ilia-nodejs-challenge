// Mock TypeORM to prevent database connections during tests
/* eslint-disable @typescript-eslint/no-unused-vars */
jest.mock('typeorm', () => ({
  DataSource: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(true),
    destroy: jest.fn().mockResolvedValue(true),
  })),
  Repository: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
  Entity: jest.fn(() => (target: any) => target),
  PrimaryGeneratedColumn: jest.fn(() => (_target: any, _propertyKey: string) => {}),
  Column: jest.fn(() => (_target: any, _propertyKey: string) => {}),
  CreateDateColumn: jest.fn(() => (_target: any, _propertyKey: string) => {}),
  UpdateDateColumn: jest.fn(() => (_target: any, _propertyKey: string) => {}),
  ManyToOne: jest.fn(() => (_target: any, _propertyKey: string) => {}),
  OneToMany: jest.fn(() => (_target: any, _propertyKey: string) => {}),
  JoinColumn: jest.fn(() => (_target: any, _propertyKey: string) => {}),
  InjectRepository: jest.fn(() => (_target: any, _propertyKey: string) => {}),
}));

jest.mock('@nestjs/typeorm', () => ({
  TypeOrmModule: {
    forRoot: jest.fn().mockReturnValue({
      module: 'TypeOrmModule',
      providers: [],
      exports: [],
    }),
    forRootAsync: jest.fn().mockReturnValue({
      module: 'TypeOrmModule',
      providers: [],
      exports: [],
    }),
    forFeature: jest.fn().mockReturnValue({
      module: 'TypeOrmModule',
      providers: [],
      exports: [],
    }),
  },
  getRepositoryToken: jest.fn((entity) => entity),
  InjectRepository: jest.fn(() => (_target: any, _propertyKey: string) => {}),
}));
/* eslint-enable @typescript-eslint/no-unused-vars */

// Load test environment variables (path relative to this file: wallet-service/.env.test)
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// Set test environment
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
