# Vue SPA with ZITADEL

[Vue 3](https://vuejs.org/) is a progressive JavaScript framework for building user interfaces. Paired with [Vite](https://vitejs.dev/) and [Vue Router](https://router.vuejs.org/), it lets you ship fast, type-safe Single Page Applications with a great developer experience.

To secure such an application, you need a reliable way to handle user logins. This example uses [`@zitadel/vue-auth`](https://github.com/zitadel/vue-auth), a client-side library that brings OpenID Connect to Vue with idiomatic composables and a `vue-router` guard. There is no backend and no server session: the whole flow runs in the browser.

We use the **OpenID Connect (OIDC)** protocol with the **Authorization Code Flow + PKCE**. This is the industry-best practice for browser-based public clients, where no client secret can be kept private. You can learn more in our [guide to OAuth 2.0 recommended flows](https://zitadel.com/docs/guides/integrate/login/oidc/oauth-recommended-flows).

Because this is a pure SPA, there is **no client secret** anywhere in this project. Every configuration value is shipped to the browser, and that is by design — PKCE replaces the secret with a per-request proof.

## Example Application

This example application showcases a typical SPA authentication pattern: users start on a public landing page, click a login button to authenticate with ZITADEL, and are then redirected to a protected profile page displaying their user information. An API demo page calls the ZITADEL userinfo endpoint with the access token as a Bearer token. Logout clears the local session and redirects through ZITADEL's end-session endpoint.

Protected routes are secured with the `createAuthGuard()` navigation guard wired into `router.beforeEach`, which enforces the `meta.requiresAuth` flag on routes (including the `/profile` page and the bundled `/auth/account` page).

### Prerequisites

Before you begin, ensure you have the following:

#### System Requirements

- Node.js (v24 or later)
- npm, yarn, or pnpm package manager

#### Account Setup

You'll need a ZITADEL account and an application configured as a **User Agent / SPA** client using the **Authorization Code + PKCE** flow (no client secret). Follow the [ZITADEL documentation on creating applications](https://zitadel.com/docs/guides/integrate/login/oidc/web-app) to set it up.

> **Important:** Configure the following URLs in your ZITADEL application settings:
>
> - **Redirect URIs:** Add `http://localhost:3000/auth/callback` (for development)
> - **Post Logout Redirect URIs:** Add `http://localhost:3000/auth/logout/callback` (for development)
>
> These URLs must exactly match what your Vue application uses. For production, add your production URLs.

### Configuration

Copy the `.env.example` file to a new file named `.env` and fill in your ZITADEL application details. Vite only exposes variables prefixed with `VITE_` to the browser.

```dotenv
# The network port the Vite dev server listens on.
PORT=3000

# Your ZITADEL instance domain. Example: https://my-org-a1b2c3.zitadel.cloud
VITE_ZITADEL_DOMAIN="https://your-zitadel-domain"

# The Client ID of your ZITADEL SPA (PKCE) application.
VITE_ZITADEL_CLIENT_ID="your-client-id"

# OAuth callback URL. MUST match a Redirect URI in your ZITADEL application.
VITE_ZITADEL_CALLBACK_URL="http://localhost:3000/auth/callback"

# Post-logout URL. MUST match a Post Logout Redirect URI in ZITADEL.
VITE_ZITADEL_POST_LOGOUT_URL="http://localhost:3000/auth/logout/callback"
```

There is intentionally no `SESSION_SECRET`, `AUTH_SECRET`, or `CLIENT_SECRET`: a PKCE public client holds no secret.

### Installation and Running

```bash
# 1. Install the project dependencies (links @zitadel/vue-auth from ../)
npm install

# 2. Start the development server
npm run dev
# or
make start
```

The application will now be running at `http://localhost:3000`.

## How it works

- **`src/main.ts`** wraps the app in the default `AuthProvider`, passing the `VITE_ZITADEL_*` config inline plus an `onSigninCallback` that strips the `code`/`state` params from the URL after the redirect.
- **`src/router.ts`** spreads `zitadelRoutes` (the `/auth/*` bundle) alongside the app routes and registers `createAuthGuard()` in `router.beforeEach`.
- **`/auth/callback`** completes the PKCE code exchange; **`/auth/logout/callback`** handles the post-logout return. Both are provided by `zitadelRoutes`.
- **`src/pages/Profile.vue`** is gated by `meta.requiresAuth` and renders the ID token claims.
- **`src/pages/ApiDemo.vue`** calls the userinfo endpoint with the access token.

## Key Features

### PKCE Authentication Flow

The Authorization Code Flow with PKCE, the recommended approach for browser-based public clients.

### Reactive Session

`useAuth()` exposes a reactive `Ref` with `isAuthenticated`, `isLoading`, `user`, and `error`, plus `signinRedirect` / `signoutRedirect`.

### Route Protection

`createAuthGuard()` redirects unauthenticated users to sign in before protected routes render.

### Logout Flow

Logout clears the local session and redirects through ZITADEL's end-session endpoint back to the post-logout callback.

## Resources

- **Vue Documentation:** <https://vuejs.org/>
- **`@zitadel/vue-auth`:** <https://github.com/zitadel/vue-auth>
- **ZITADEL Documentation:** <https://zitadel.com/docs>
