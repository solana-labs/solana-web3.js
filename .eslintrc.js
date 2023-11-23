module.exports = {
    extends: [
        'turbo',
        '@solana/eslint-config-solana',
        '@solana/eslint-config-solana/jest',
        'plugin:require-extensions/recommended',
    ],
    plugins: ['require-extensions'],
    root: true,
};
