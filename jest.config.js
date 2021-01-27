module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['<rootDir>/packages/(?:.+?)/lib/'],
  testPathIgnorePatterns: [
    '<rootDir>/packages/(?:.+?)/lib/',
    '<rootDir>/test/dev-and-e2e-test-environment',
    '<rootDir>/packages/',
  ],
};
