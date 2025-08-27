/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'node',
  watchman: false,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/babel.config.js',
    '!**/jest.config.js',
  ],
};
