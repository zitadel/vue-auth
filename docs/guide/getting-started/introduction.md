---
title: Introduction
group: Getting Started
children:
  - ./installation.md
---

# Introduction

`@zitadel/vue-auth` is an open source library that provides authentication
for [Vue 3](https://vuejs.org/) single-page applications. It wraps
[`oidc-client-ts`](https://github.com/authts/oidc-client-ts) to bring the
OpenID Connect Authorization Code Flow with PKCE to Vue with a native
developer experience.

Through idiomatic Vue `provide`/`inject` and composables, you can access
and react to the user's authentication state anywhere in your component
tree. There is no backend, no server session, and no client secret: the
entire flow runs in the browser.

## Features

### Authentication

- Authorization Code Flow with PKCE (public client, no secret)
- Automatic detection of the authorization response on return
- Silent token renewal in a hidden iframe

### Application Side Session Management

- Reactive session via the `useAuth()` composable
- Methods to `signinRedirect` and `signoutRedirect`
- Full TypeScript support for all methods and properties

### Application protection

- Global route gating with `createAuthGuard()` for `vue-router`
- Higher-order guards via `withAuthenticationRequired`
- One-shot redirect on load with `useAutoSignin`
