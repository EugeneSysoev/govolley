const base = require('../jest.config.cjs');
module.exports = { ...base, rootDir: '..', testRegex: 'test/.*\\.postgres-spec\\.ts$', testTimeout: 30000 };
