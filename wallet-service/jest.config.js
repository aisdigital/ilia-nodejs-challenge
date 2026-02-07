const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.test') });

module.exports = {
  projects: [
    {
      displayName: 'unit',
      preset: 'ts-jest',
      testEnvironment: 'node',
      roots: ['<rootDir>/tests'],
      testMatch: ['**/*.spec.ts'],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/index.ts'
      ],
      coveragePathIgnorePatterns: [
        '/node_modules/',
        '/dist/'
      ],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          tsconfig: {
            esModuleInterop: true,
          }
        }]
      }
    },
    {
      displayName: 'e2e',
      preset: 'ts-jest',
      testEnvironment: 'node',
      roots: ['<rootDir>/tests'],
      testMatch: ['**/*.test.ts'],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      maxWorkers: 1,
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          tsconfig: {
            esModuleInterop: true,
          }
        }]
      }
    },
  ],
};
