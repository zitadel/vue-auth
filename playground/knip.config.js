module.exports = {
  ignoreDependencies: [
    '@commitlint/config-conventional',
    '@zitadel/vue-auth',
    'oidc-client-ts',
  ],
  rules: {
    unresolved: 'off',
  },
  entry: ['src/main.ts'],
  ignore: ['commitlint.config.js'],
};
