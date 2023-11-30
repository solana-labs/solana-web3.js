module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    mocha: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 8,
  },
  plugins: ['@typescript-eslint'],
  root: true,
  rules: {
    '@typescript-eslint/no-unused-vars': ['error'],
    'linebreak-style': ['error', 'unix'],
    'no-console': [0],
    'no-trailing-spaces': ['error'],
    'no-undef': 'off',
    'no-unused-vars': 'off',
    quotes: [
      'error',
      'single',
      { avoidEscape: true, allowTemplateLiterals: true },
    ],
    'require-await': ['error'],
    semi: ['error', 'always'],
  },
};
