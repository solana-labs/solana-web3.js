import solanaConfig from '@solana/eslint-config-solana';
import solanaJestConfig from '@solana/eslint-config-solana/jest';

export default [
    ...solanaConfig,
    ...solanaJestConfig,
    {
        rules: {
            '@typescript-eslint/no-base-to-string': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-enum-comparison': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/only-throw-error': 'off',
            '@typescript-eslint/prefer-promise-reject-errors': 'off',
            '@typescript-eslint/restrict-plus-operands': 'error',
            '@typescript-eslint/restrict-template-expressions': 'error',
            '@typescript-eslint/unbound-method': 'off',
            'jest/expect-expect': [
                'error',
                {
                    assertFunctionNames: ['expect', 'expectNewPreOffset', 'expectNewPostOffset'],
                },
            ],
        },
    },
];
