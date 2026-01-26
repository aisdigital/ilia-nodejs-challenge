module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../..',
  testMatch: ['<rootDir>/test/integration/**/*.spec.ts'],
  transform: {
    '^.+\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['<rootDir>/src/**/*.(t|j)s'],
  coverageDirectory: '../../coverage/users-service/integration',
  testEnvironment: 'node',
};
