---
layout: home

title: Vue Auth

hero:
  name: VueAuth
  text: Authentication for Vue SPAs!
  tagline: Client-side PKCE OpenID Connect for Vue 3!
  actions:
    - theme: brand
      text: Get started!
      link: /guide/getting-started/introduction
    - theme: alt
      text: GitHub
      link: https://github.com/zitadel/vue-auth

features:
  - title: PKCE OIDC
    details: Authorization Code Flow with PKCE in the browser, no client secret, no backend required.
  - title: Reactive Composables
    details: useAuth() exposes a reactive ref with isAuthenticated, isLoading, user, and error.
  - title: Router Guard
    details: createAuthGuard() wires straight into vue-router's beforeEach to gate routes by meta.
  - title: Ready-made Routes
    details: zitadelRoutes ships sign-in, callback, error, logout, and account pages under /auth.
  - title: Silent Renew
    details: Tokens refresh silently in a hidden iframe and flow into auth state automatically.
  - title: Higher-order Guards
    details: withAuthenticationRequired wraps any component so anonymous users are redirected to sign in.
  - title: Made for Vue 3
    details: Idiomatic provide/inject, composables, and Single File Component friendly.
  - title: Easy deployment
    details: Ship to any static host with a SPA history fallback.
---
