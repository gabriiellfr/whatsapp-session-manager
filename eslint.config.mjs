import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
    {
        files: ['**/*.js'],
        languageOptions: {
            sourceType: 'commonjs',
            globals: {
                ...globals.node, // Include Node.js globals (like `process`, `__dirname`, etc.)
            },
        },
        rules: {
            // Add your custom rules here, if any
        },
    },
    {
        languageOptions: {
            globals: {
                ...globals.browser, // Include browser globals if needed for other files
            },
        },
    },
    pluginJs.configs.recommended, // ESLint's recommended rules
];
