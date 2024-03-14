module.exports = {
    extends: ['turbo', '@solana/eslint-config-solana', '@solana/eslint-config-solana/jest'],
    root: true,
    rules: {
        'jest/expect-expect': [
            'error',
            { assertFunctionNames: ['expect', 'expectNewPreOffset', 'expectNewPostOffset'] },
        ],
    },
};
