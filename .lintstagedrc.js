'use strict';

// Windows PowerShell 5.1 does not support && pipeline chaining.
// Call ESLint binaries directly via Node to avoid shell compatibility issues.
// Frontend needs --config because ESLint v9 resolves flat config from CWD, not file location.
module.exports = {
  'backend/src/**/*.js': 'node backend/node_modules/eslint/bin/eslint.js --fix',
  'frontend/src/**/*.{js,jsx}': 'node frontend/node_modules/eslint/bin/eslint.js --config frontend/eslint.config.js --fix',
};
