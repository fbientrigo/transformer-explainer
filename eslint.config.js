import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';

export default [
	{
		ignores: [
			'.DS_Store',
			'node_modules/**',
			'build/**',
			'.svelte-kit/**',
			'package/**',
			'.env',
			'.env.*',
			'!.env.example',
			'pnpm-lock.yaml',
			'package-lock.json',
			'yarn.lock',
			'src/constants/examples/**'
		]
	},
	js.configs.recommended,
	...svelte.configs['flat/recommended'],
	{
		files: ['**/*.{ts,tsx,mts,cts}'],
		languageOptions: {
			parser: tsParser,
			parserOptions: { ecmaVersion: 2020, sourceType: 'module' }
		},
		plugins: { '@typescript-eslint': tsPlugin },
		rules: {
			...tsPlugin.configs['flat/recommended'][1].rules,
			...tsPlugin.configs['flat/recommended'][2].rules,
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
			]
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: { parserOptions: { parser: tsParser } },
		plugins: { '@typescript-eslint': tsPlugin },
		rules: {
			'no-undef': 'off',
			'no-unused-vars': 'off',
			'no-useless-assignment': 'off',
			'svelte/no-at-html-tags': 'off',
			'svelte/no-reactive-functions': 'off',
			'svelte/require-each-key': 'off',
			'svelte/no-useless-mustaches': 'off',
			'svelte/no-navigation-without-resolve': 'off',
			'svelte/no-dom-manipulating': 'off',
			'svelte/no-reactive-reassign': 'off',
			'svelte/no-immutable-reactive-statements': 'off',
			'no-unassigned-vars': 'off',
			'svelte/infinite-reactive-loop': 'warn'
		}
	},
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		}
	},
	prettier
];
