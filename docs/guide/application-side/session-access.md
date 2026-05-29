---
title: Session Access
group: Application Side
---

# Client-side session access

`useAuth()` returns a reactive
[`Ref`](https://vuejs.org/api/reactivity-core.html#ref) of the auth
context. Read every field through `.value`, both in `setup()` and in
templates.

## Reading the session

```ts
import { useAuth } from '@zitadel/vue-auth';

const auth = useAuth();

// auth.value.isAuthenticated — boolean
// auth.value.isLoading       — boolean
// auth.value.user            — the oidc-client-ts User, or undefined
// auth.value.error           — the last error, or undefined
```

```vue
<template>
  <p v-if="auth.isLoading">Loading...</p>
  <p v-else-if="auth.error">{{ auth.error.message }}</p>
  <p v-else-if="auth.isAuthenticated">
    Hello, {{ auth.user?.profile.name }}
  </p>
  <button v-else @click="auth.signinRedirect()">Sign in</button>
</template>
```

## Sign in and sign out

```ts
const auth = useAuth();
const login = (): void => void auth.value.signinRedirect();
const logout = (): void => void auth.value.signoutRedirect();
```

## Using the access token for API calls

The access token lives on the loaded user. Send it as a Bearer token:

```ts
const auth = useAuth();

const res = await fetch('https://api.example.com/data', {
  headers: { Authorization: `Bearer ${auth.value.user?.access_token}` },
});
```

## Detecting the authorization response

`hasAuthParams()` reports whether the current URL carries an OIDC
authorization response (`code`/`error` plus `state`), in either the query
string or the fragment. It is useful for guarding manual redirect logic:

```ts
import { hasAuthParams } from '@zitadel/vue-auth';

if (!hasAuthParams() && !auth.value.isAuthenticated) {
  void auth.value.signinRedirect();
}
```
