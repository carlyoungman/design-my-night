// eslint.config.js
const { FlatCompat } = require('@eslint/eslintrc');
const globals = require('globals');
const tsParser = require('@typescript-eslint/parser');

const compat = new FlatCompat({ baseDirectory: __dirname });

module.exports = [
  { ignores: ['dist/**', 'node_modules/**'] },
  ...compat.extends([
    '@wordpress/eslint-plugin/recommended-with-formatting',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ]),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: tsParser,
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
