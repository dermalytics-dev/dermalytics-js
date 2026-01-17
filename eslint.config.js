module.exports = [
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: require('@typescript-eslint/parser'),
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
            },
        },
        plugins: {
            '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
        },
        rules: {
            // Add any custom rules here
        },
    },
    {
        ignores: ['dist/**', 'node_modules/**', '*.config.js'],
    },
];
