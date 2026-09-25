module.exports = {
	extends: ['stylelint-config-standard-scss', 'stylelint-config-recess-order'],
	plugins: ['stylelint-selector-bem-pattern'],
	rules: {
		// Own classes use BEM (block__element--modifier, kebab-case) plus is-/has- state classes.
		// Third-party classes we style (MUI: Mui*) keep their own naming.
		'selector-class-pattern': [
			'^(?:is|has)-[a-z0-9]+(?:-[a-z0-9]+)*$|^[a-z0-9]+(?:-[a-z0-9]+)*(?:__(?:[a-z0-9]+(?:-[a-z0-9]+)*))*(?:--(?:[a-z0-9]+(?:-[a-z0-9]+)*))?$|^Mui[A-Za-z]*(?:-[A-Za-z]+)*$',
			{message: 'Use BEM: block, block__element, block--modifier (kebab-case).'}
		],
		'plugin/selector-bem-pattern': {
			preset: 'bem',
			implicitComponents: 'public-src/**/*.scss'
		},
		// Nested SCSS with :hover/:focus/:disabled states trips this rule constantly without catching real bugs.
		'no-descending-specificity': null,
		// Allows WordPress's own variables such as --wp-admin--admin-bar--height.
		'custom-property-pattern': '^[a-z0-9]+(?:-{1,2}[a-z0-9]+)*$',
		'scss/load-partial-extension': 'never',
		'scss/no-global-function-names': null
	},
	 ignoreFiles: ['**/dist/**', '**/node_modules/**'],
};
