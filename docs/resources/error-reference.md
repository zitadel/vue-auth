---
title: Error Reference
group: Resources
---

# Errors and warnings

This is a list of errors and warnings the library can surface, what each
means, and how to resolve them. Runtime errors are reported through
`auth.value.error`, whose `source` field names the operation that failed.

## AuthProvider context is undefined

```
AuthProvider context is undefined, please verify you are calling
useAuth() as child of a <AuthProvider> component.
```

This error is thrown by `useAuth()` (and anything built on it, such as
`createAuthGuard`, `withAuthenticationRequired`, and `useAutoSignin`) when
it runs outside the `AuthProvider` tree. Wrap your root component in
`AuthProvider` so the context is provided.

## Sign-in failed (`source: 'signinCallback'`)

Reported when completing the authorization response fails, typically a
bad or expired `code`, a `state` mismatch, or a `redirect_uri` that does
not match the one registered in ZITADEL. Verify the `redirect_uri` prop
matches a ZITADEL Redirect URI exactly, and that the callback route is
reachable.

## Sign-out failed (`source: 'signoutCallback'`)

Reported when handling the post-logout redirect fails. Ensure
`post_logout_redirect_uri` matches a ZITADEL Post Logout Redirect URI and
that `matchSignoutCallback` correctly identifies the return.

## Renew silent failed (`source: 'renewSilent'`)

Reported when an automatic silent token renewal fails, usually because the
provider session has expired or `silent_redirect_uri` is not registered.
Fall back to an interactive `signinRedirect()`. See
[Silent Renew](../guide/advanced/silent-renew.md).

## UserManager#... was called from an unsupported context

```
UserManager#<method> was called from an unsupported context. If this is a
server-rendered page, defer this call with onMounted() or pass a custom
UserManager implementation.
```

The `UserManager` needs a browser environment (`window`). This appears
when an auth method runs during server-side rendering. Defer the call with
`onMounted()`, or pass a pre-constructed `userManager` to `AuthProvider`.
