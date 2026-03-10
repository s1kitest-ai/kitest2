module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    // customize rules as needed
    'no-unused-vars': ['warn'],
    'no-console': 'off',
  },
};
