module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {ecmaVersion: 2022, sourceType: 'module'},
	env: {browser: true, es2022: true, node: true},
	extends: [
		'@wordpress/eslint-plugin/recommended-with-formatting',
		'plugin:@typescript-eslint/recommended',
		'plugin:react-hooks/recommended'
	],
  ignorePatterns: ['dist/', 'node_modules/']
	rules: {
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-explicit-any': 'warn'
	}
};
