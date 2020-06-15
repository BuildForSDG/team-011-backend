module.exports = {
  moduleFileExtensions: ["js", "json"],
  rootDir: "src",
  roots: ["../tests", "../"],
  testRegex: [".spec.js$", ".test.js$"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  bail: 1,
  verbose: true,
  forceExit: true,
  collectCoverageFrom: ["**/*.js"],
  setupFilesAfterEnv: ["../tests/jest.setup.js"]
};
