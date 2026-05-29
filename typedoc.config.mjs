// noinspection JSUnusedGlobalSymbols
/** @type {import('typedoc').TypeDocOptions} */
export default {
  entryPoints: ['src/index.ts', 'src/components/index.ts', 'src/routes.ts'],
  projectDocuments: [
    'docs/guide/getting-started/introduction.md',
    'docs/guide/vue/quick-start.md',
    'docs/guide/application-side/configuration.md',
    'docs/guide/advanced/silent-renew.md',
  ],
  out: '.out/docs',
  tsconfig: './tsconfig.json',
  readme: 'README.md',
  excludeInternal: true,
  excludePrivate: true,
  highlightLanguages: [
    'typescript',
    'javascript',
    'json',
    'jsx',
    'tsx',
    'vue',
    'bash',
    'sh',
    'html',
    'dotenv',
  ],
  externalSymbolLinkMappings: {
    'oidc-client-ts': {
      User: 'https://authts.github.io/oidc-client-ts/classes/User.html',
      UserManager:
        'https://authts.github.io/oidc-client-ts/classes/UserManager.html',
      UserManagerSettings:
        'https://authts.github.io/oidc-client-ts/interfaces/UserManagerSettings.html',
      ErrorResponse:
        'https://authts.github.io/oidc-client-ts/classes/ErrorResponse.html',
    },
    '@vue/reactivity': {
      Ref: 'https://vuejs.org/api/reactivity-core.html#ref',
    },
  },
  cleanOutputDir: true,
  treatWarningsAsErrors: false,
  validation: {
    invalidLink: true,
    notExported: true,
    notDocumented: false,
  },
};
