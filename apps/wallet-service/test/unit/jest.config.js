module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../..',
  testMatch: ['<rootDir>/test/unit/**/*.spec.ts'],
  testPathIgnorePatterns: ['<rootDir>/test/unit/main.spec.ts', '<rootDir>/test/unit/app.module.spec.ts'],
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.app.json', diagnostics: false }],
  },
  coverageProvider: 'v8',
  collectCoverageFrom: [
    '<rootDir>/src/modules/wallet/**/*.(t|j)s',
    '<rootDir>/src/modules/auth/**/*.(t|j)s',
    '!<rootDir>/src/**/*.module.ts',
  ],
  coverageDirectory: '../../coverage/wallet-service/unit',
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
  testEnvironment: 'node',
  maxWorkers: 1,
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  verbose: false,
  silent: true,
  setupFilesAfterEnv: ['<rootDir>/test/unit/setup.ts'],
  testTimeout: 10000,
  forceExit: true,
  detectOpenHandles: false,
};
