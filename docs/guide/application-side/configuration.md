---
title: Configuration
group: Application Side
children:
  - ./protecting-pages.md
  - ./session-access.md
---

# Provider Configuration

`AuthProvider` accepts the full
[`UserManagerSettings`](https://authts.github.io/oidc-client-ts/interfaces/UserManagerSettings.html)
shape from `oidc-client-ts` inline as props, plus a few lifecycle hooks.
The most-used keys are below.

## `authority`

- **Type**: `string`
- **Required**

The base URL of your OpenID Connect provider (your ZITADEL instance
domain), used to discover the authorization, token, and userinfo
endpoints.

## `client_id`

- **Type**: `string`
- **Required**

The Client ID of your application as registered in ZITADEL. The
application must be configured as a public client using the Authorization
Code Flow with PKCE; no client secret is used.

## `redirect_uri`

- **Type**: `string`
- **Required**

The URL the provider redirects back to after authentication. With the
bundled routes this is `/auth/callback`. It must exactly match a Redirect
URI configured in ZITADEL.

## `post_logout_redirect_uri`

- **Type**: `string`

The URL the provider redirects to after logout. With the bundled routes
this is `/auth/logout/callback`. It must match a Post Logout Redirect URI
configured in ZITADEL.

## `scope`

- **Type**: `string`
- **Default**: `openid profile email`

The space-separated OIDC scopes requested at sign-in.

## `onSigninCallback`

- **Type**: `(user: User | undefined) => void | Promise<void>`

A hook invoked after a successful sign-in callback. Use it to strip the
`code` and `state` parameters from the URL after returning from the
authorize endpoint:

```ts
onSigninCallback: () =>
  window.history.replaceState({}, document.title, window.location.pathname);
```

## Environment variables

In a Vite app, expose configuration via `import.meta.env.VITE_*`:

```dotenv
VITE_ZITADEL_DOMAIN="https://your-zitadel-domain"
VITE_ZITADEL_CLIENT_ID="your-client-id"
VITE_ZITADEL_CALLBACK_URL="http://localhost:3000/auth/callback"
VITE_ZITADEL_POST_LOGOUT_URL="http://localhost:3000/auth/logout/callback"
```

```ts
h(AuthProvider, {
  authority: import.meta.env.VITE_ZITADEL_DOMAIN,
  client_id: import.meta.env.VITE_ZITADEL_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_ZITADEL_CALLBACK_URL,
  post_logout_redirect_uri: import.meta.env.VITE_ZITADEL_POST_LOGOUT_URL,
});
```

Because PKCE public clients hold no secret, there is nothing private to
store; the values above are safe to ship to the browser.
