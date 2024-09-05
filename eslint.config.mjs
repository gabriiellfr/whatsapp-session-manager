import globals from 'globals';
import pluginJs from '@eslint/js';
import sveltePlugin from 'eslint-plugin-svelte3';

export default {
    overrides: [
        {
            files: ['**/*.js'],
            languageOptions: {
                sourceType: 'commonjs',
                globals: {
                    ...globals.node,
                },
            },
            plugins: {
                'eslint-plugin-svelte3': sveltePlugin,
            },
            rules: {},
        },
        {
            files: ['**/*.svelte'],
            processor: 'svelte3/svelte3',
            languageOptions: {
                globals: {
                    ...globals.browser,
                },
            },
            plugins: {
                'eslint-plugin-svelte3': sveltePlugin,
            },
            rules: {},
        },
    ],
    extends: [pluginJs.configs.recommended, 'plugin:svelte3/recommended'],
    settings: {
        'svelte3/ignore-styles': () => true,
        'svelte3/ignore-warnings': () => true,
    },
};
