module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globalSetup: './tests/jest/globalSetup.ts',
  globalTeardown: './tests/jest/globalTeardown.ts',
};