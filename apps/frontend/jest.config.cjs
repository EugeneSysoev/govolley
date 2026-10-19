module.exports = {
  testEnvironment: 'jsdom', testMatch: ['<rootDir>/test/**/*.test.tsx', '<rootDir>/test/**/*.test.ts'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1', '^(\\.{1,2}/.*)\\.js$': '$1', '^@govolley/shared-types$': '<rootDir>/../../packages/shared-types/src/index.ts' },
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx', module: 'CommonJS', moduleResolution: 'Node', verbatimModuleSyntax: false, isolatedModules: true } }] },
};
