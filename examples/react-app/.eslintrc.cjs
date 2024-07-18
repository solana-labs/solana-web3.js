module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: ['../../.eslintrc.js', '@solana/eslint-config-solana/react'],
    ignorePatterns: ['dist', '.eslintrc.cjs'],
    parserOptions: {
        project: './tsconfig.app.json',
    },
    plugins: ['react-refresh'],
    rules: {
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
};
