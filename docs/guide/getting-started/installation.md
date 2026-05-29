---
title: Installation
group: Getting Started
---

# Installation

Install `@zitadel/vue-auth` alongside its peer dependencies:

```bash
# npm
npm install @zitadel/vue-auth oidc-client-ts vue-router

# pnpm
pnpm add @zitadel/vue-auth oidc-client-ts vue-router

# yarn
yarn add @zitadel/vue-auth oidc-client-ts vue-router
```

`vue` is assumed to already be present in your project. `vue-router` is an
optional peer dependency: install it if you intend to use `zitadelRoutes`
or `createAuthGuard`.

Wrap your application in the `AuthProvider` so the auth context is
available to every component:

```ts
// src/main.ts
import { createApp, h } from 'vue';
import { AuthProvider } from '@zitadel/vue-auth';
import App from './App.vue';

createApp({
  render: () =>
    h(
      AuthProvider,
      {
        authority: import.meta.env.VITE_ZITADEL_DOMAIN,
        client_id: import.meta.env.VITE_ZITADEL_CLIENT_ID,
        redirect_uri: import.meta.env.VITE_ZITADEL_CALLBACK_URL,
      },
      () => h(App),
    ),
}).mount('#app');
```
