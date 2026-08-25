// Fixed so snapshots that render a time of day do not depend on the machine.
process.env.TZ = 'UTC';

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.tsx'],
  testMatch: ['<rootDir>/tests/**/*.test.tsx'],
  // Router tests mount the whole app, which is slower than a unit test.
  testTimeout: 30000,
  collectCoverageFrom: ['src/**/*.{ts,tsx}', 'app/**/*.tsx'],
};
