module.exports = {
  moduleFileExtensions: ['js', 'json'],
  rootDir: '__tests__',
  testRegex: ['.spec.js$', '.test.js$'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  bail: 1,
  verbose: true,
  setupFilesAfterEnv: ['./jest.setup.js'],
  preset: '@shelf/jest-mongodb'
};
