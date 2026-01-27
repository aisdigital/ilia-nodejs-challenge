module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '..',
  testMatch: ['<rootDir>/test/**/*.spec.ts'],
  transform: {
    '^.+\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['<rootDir>/src/**/*.(t|j)s'],
  coverageDirectory: '../../coverage/wallet-service/all',
  testEnvironment: 'node',
  maxWorkers: 1,
  silent: true,
  cacheDirectory: '<rootDir>/../../.jest-cache',
};