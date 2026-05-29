import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '~': resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 3000,
    headers: {
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
});
