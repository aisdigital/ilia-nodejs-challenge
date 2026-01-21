import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  clearMocks: true,
  silent: false,
  verbose: true,
  transform: {
    '^.+\\.(t|j)s?$': '@swc/jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!@faker-js/faker)',
    '/node_modules/(?!@prisma|.prisma)',
  ],
  testMatch: ['**/e2e-tests/**/*.(test|spec).ts'],
  detectOpenHandles: true,
  forceExit: true,
  testTimeout: 50000,
};

export default config;
