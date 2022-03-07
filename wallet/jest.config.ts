const { pathsToModuleNameMapper } = require('ts-jest/utils')
const { compilerOptions } = require('./tsconfig.json')

module.exports = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/modules/**/services/*.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    "text-summary",
    "lcov"
  ],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {prefix: '<rootDir>/src/'}),
  preset: 'ts-jest',
  setupFiles:["reflect-metadata"],
  testEnvironment: "node",
  testMatch: [
    "**/*.spec.ts",
  ],
};
