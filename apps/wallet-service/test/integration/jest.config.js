module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../..',
  testMatch: ['<rootDir>/test/integration/**/*.spec.ts'],
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.app.json', diagnostics: false }],
  },
  coverageProvider: 'v8',
  collectCoverageFrom: [
    '<rootDir>/src/modules/wallet/**/*.(t|j)s',
    '<rootDir>/src/modules/auth/**/*.(t|j)s',
    '!<rootDir>/src/**/*.module.ts',
  ],
  coverageDirectory: '../../coverage/wallet-service/integration',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testEnvironment: 'node',
};