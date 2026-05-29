/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ZITADEL_DOMAIN: string;
  readonly VITE_ZITADEL_CLIENT_ID: string;
  readonly VITE_ZITADEL_CALLBACK_URL: string;
  readonly VITE_ZITADEL_POST_LOGOUT_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<
    Record<string, unknown>,
    Record<string, unknown>,
    unknown
  >;
  export default component;
}
