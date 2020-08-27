module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['<rootDir>/packages/(?:.+?)/lib/'],
  testPathIgnorePatterns: ['<rootDir>/packages/(?:.+?)/lib/'],
};
