---
title: Silent Renew
group: Advanced
children:
  - ./hosting.md
---

# Silent token renewal

Access tokens are short-lived. Rather than forcing the user through a
visible redirect when a token expires, OIDC supports renewing it silently
in a hidden iframe. `@zitadel/vue-auth` wires the `oidc-client-ts`
`UserManager` events for you, so a renewed token flows into auth state
with no manual subscription.

## Enabling it

Pass the silent-renew settings as `AuthProvider` props:

```ts
h(AuthProvider, {
  authority: import.meta.env.VITE_ZITADEL_DOMAIN,
  client_id: import.meta.env.VITE_ZITADEL_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_ZITADEL_CALLBACK_URL,
  automaticSilentRenew: true,
  silent_redirect_uri: `${window.location.origin}/auth/callback`,
});
```

With `automaticSilentRenew` enabled, the `UserManager` schedules a renewal
shortly before the access token expires. The renewal happens in a hidden
iframe pointed at `silent_redirect_uri`, which must be registered as a
Redirect URI in ZITADEL.

## What happens on renewal

1. The `UserManager` opens a hidden iframe and re-runs the authorization
   request using the existing session at the provider.
2. On success a fresh `User` is loaded and the `userLoaded` event fires.
3. The provider dispatches the new user into auth state, so
   `auth.value.user` (and its `access_token`) updates reactively.

## Handling renewal failure

If a silent renewal fails (for example, the provider session expired), a
silent-renew error is surfaced through `auth.value.error`. Read it and
fall back to an interactive sign-in:

```ts
import { watch } from 'vue';
import { useAuth } from '@zitadel/vue-auth';

const auth = useAuth();
watch(
  () => auth.value.error,
  (error) => {
    if (error?.source === 'renewSilent') {
      void auth.value.signinRedirect();
    }
  },
);
```
