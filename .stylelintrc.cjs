module.exports = {
	extends: ['stylelint-config-standard-scss', 'stylelint-config-recess-order'],
	plugins: ['stylelint-selector-bem-pattern'],
	rules: {
		'selector-class-pattern': [
			'^(?:is|has)-[a-z0-9]+(?:-[a-z0-9]+)*$|^[a-z0-9]+(?:-[a-z0-9]+)*(?:__(?:[a-z0-9]+(?:-[a-z0-9]+)*))?(?:--(?:[a-z0-9]+(?:-[a-z0-9]+)*))?$',
			{message: 'Use BEM: block, block__element, block--modifier (kebab-case).'}
		],
		'plugin/selector-bem-pattern': {
			preset: 'bem',
			implicitComponents: 'public-src/**/*.scss'
		},
		'scss/at-import-partial-extension': 'never',
		'scss/no-global-function-names': null
	},
	 ignoreFiles: ['**/dist/**', '**/node_modules/**'],
};
