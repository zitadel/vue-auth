import { defineConfig } from 'tsup';

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'components/index': 'src/components/index.ts',
    routes: 'src/routes.ts',
  },
  format: ['esm'],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: {
    resolve: false,
  },
  external: ['vue', 'vue-router', 'oidc-client-ts'],
});
