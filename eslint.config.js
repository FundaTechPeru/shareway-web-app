const ignores = require('./eslint.ignores.js');

module.exports = [
  {ignores},
  ...require('gts'),
  {
    // Angular uses a solution-style tsconfig.json (`files: []` + references),
    // so typed linting must point to the concrete app and spec projects.
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.spec.json'],
        tsconfigRootDir: __dirname,
      },
    },
  },
];
