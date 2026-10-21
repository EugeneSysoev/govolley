const base = require('../jest.config.cjs');
module.exports = { ...base, rootDir: '..', testRegex: 'test/.*\\.e2e-spec\\.ts$' };
