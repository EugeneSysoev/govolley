module.exports = {
  rootDir: '.', testRegex: 'src/.*\\.spec\\.ts$', testEnvironment: 'node',
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1', '^@govolley/shared-types$': '<rootDir>/../../packages/shared-types/src/index.ts' },
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: { module: 'CommonJS', moduleResolution: 'Node', verbatimModuleSyntax: false, isolatedModules: true } }] },
};
