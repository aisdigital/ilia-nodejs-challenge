import type { Config } from 'jest';

const config: Config = {
  watchman: true,
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  clearMocks: true,
  silent: false,
  maxWorkers: '50%',
  transform: {
    '^.+\\.(t|j)s?$': '@swc/jest',
  },
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!@faker-js/faker)',
    '<rootDir>/src/generated/',
  ],
};

export default config;
